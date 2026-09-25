import { Router, Request, Response } from 'express';
import { Task, ITaskSubmission } from '../models/Task';
import { Activity } from '../models/Activity';
import { Employee } from '../models/Employee';
import { AIEmployee } from '../models/AIEmployee';
import { Goal } from '../models/Goal';
import { requireAuth, type AuthUser } from './authRoutes';
import { withTransaction } from '../utils/transaction';
import { executeTaskForAI, updateAIMemoryAfterApproval } from '../services/aiExecutionService';

const router = Router();

const currentCompany = (req: Request): string => {
  const user = (req as Request & { user?: AuthUser }).user;
  return user?.companyCode ?? 'FO-2026-7X4K';
};

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ companyCode: currentCompany(req) }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = currentCompany(req);
    const taskData = req.body;
    const newTask = await Task.create({
      ...taskData,
      companyCode,
      status: 'NOT_STARTED',
      submissions: [],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: `Task created and assigned to ${taskData.assigneeName}`,
          performedBy: taskData.creatorName || 'Founder'
        }
      ]
    });

    if (newTask.goalId) {
      await Goal.findOneAndUpdate(
        { _id: newTask.goalId, companyCode },
        { $addToSet: { linkedTaskIds: String(newTask._id) } }
      );
    }

    if (newTask.assigneeType === 'human') {
      await Employee.findOneAndUpdate(
        { name: newTask.assigneeName, companyCode },
        { $inc: { tasksInProgress: 1 } }
      );
    } else {
      await AIEmployee.findOneAndUpdate(
        { name: newTask.assigneeName, companyCode },
        { $inc: { tasksRunning: 1 } }
      );
      setImmediate(() => {
        executeTaskForAI(String(newTask._id), companyCode);
      });
    }

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: taskData.creatorName || 'Founder',
      actorType: 'founder',
      action: 'created and assigned task',
      target: newTask.title,
      category: 'task'
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = currentCompany(req);
    const { id } = req.params;
    const { status, performedBy } = req.body;

    const task = await withTransaction(async (session) => {
      const current = await Task.findOne({ _id: id, companyCode }, null, session ? { session } : undefined);
      if (!current) {
        throw new Error('NOT_FOUND');
      }

      current.status = status;
      current.activityLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: `Status changed to ${status}`,
        performedBy: performedBy || 'Team Member'
      });

      await current.save({ session: session || undefined });

      if (session) {
        await Activity.create([
          {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            companyCode,
            actorName: performedBy || 'Team Member',
            actorType: 'human',
            action: `moved task to ${status}`,
            target: current.title,
            category: 'task'
          }
        ], { session });
      } else {
        await Activity.create({
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          companyCode,
          actorName: performedBy || 'Team Member',
          actorType: 'human',
          action: `moved task to ${status}`,
          target: current.title,
          category: 'task'
        });
      }

      return current;
    });

    res.json(task);
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

router.post('/:id/submissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = currentCompany(req);
    const { id } = req.params;
    const { deliverableSummary, notes, submittedBy, submitterType } = req.body;

    const task = await Task.findOne({ _id: id, companyCode });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const newSub: ITaskSubmission = {
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      submittedBy: submittedBy || task.assigneeName,
      submitterType: submitterType || task.assigneeType,
      deliverableSummary,
      notes: notes || '',
      reviewStatus: 'pending' as const
    };

    task.status = 'SUBMITTED';
    task.submissions.unshift(newSub);
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Deliverable submitted for Manager Review: "${deliverableSummary.substring(0, 40)}..."`,
      performedBy: submittedBy || task.assigneeName
    });

    await task.save();

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: submittedBy || task.assigneeName,
      actorType: task.assigneeType,
      action: 'submitted deliverable for review on',
      target: task.title,
      category: 'task'
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit task deliverable' });
  }
});

router.post('/:id/submissions/:submissionId/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = currentCompany(req);
    const { id, submissionId } = req.params;
    const { decision, notes, reviewedBy } = req.body;

    const task = await withTransaction(async (session) => {
      const current = await Task.findOne({ _id: id, companyCode }, null, session ? { session } : undefined);
      if (!current) {
        throw new Error('NOT_FOUND');
      }

      const submission = current.submissions.find((s: ITaskSubmission) => s.id === submissionId);
      if (submission) {
        submission.reviewStatus = decision;
        submission.reviewedBy = reviewedBy || 'Founder';
        submission.reviewedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        submission.reviewNotes = notes || '';
      }

      current.status = decision === 'approved' ? 'COMPLETED' : 'IN_PROGRESS';
      current.activityLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: decision === 'approved' 
          ? `Submission APPROVED & task marked COMPLETED (${notes})` 
          : `Changes requested: "${notes}"`,
        performedBy: reviewedBy || 'Founder'
      });

      await current.save({ session: session || undefined });

      if (decision === 'approved') {
        if (current.assigneeType === 'human') {
          await Employee.findOneAndUpdate(
            { name: current.assigneeName, companyCode },
            { $inc: { tasksCompleted: 1, tasksInProgress: -1 } },
            session ? { session } : undefined
          );
        } else {
          await AIEmployee.findOneAndUpdate(
            { name: current.assigneeName, companyCode },
            { $inc: { tasksCompleted: 1, tasksRunning: -1 } },
            session ? { session } : undefined
          );
        }
      }

      if (session) {
        await Activity.create([
          {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            companyCode,
            actorName: reviewedBy || 'Founder',
            actorType: 'founder',
            action: decision === 'approved' ? 'approved & completed' : 'requested revisions on',
            target: current.title,
            category: 'review'
          }
        ], { session });
      } else {
        await Activity.create({
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          companyCode,
          actorName: reviewedBy || 'Founder',
          actorType: 'founder',
          action: decision === 'approved' ? 'approved & completed' : 'requested revisions on',
          target: current.title,
          category: 'review'
        });
      }

      if (decision === 'approved' && current.assigneeType === 'ai' && submission) {
        setImmediate(() => {
          updateAIMemoryAfterApproval(
            current.assigneeName,
            companyCode,
            current.title,
            submission.deliverableSummary,
            notes
          );
        });
      }

      return current;
    });

    res.json(task);
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

export default router;
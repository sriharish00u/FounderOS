import { Router, Request, Response } from 'express';
import { Task, ITaskSubmission } from '../models/Task';
import { Activity } from '../models/Activity';
import { Employee } from '../models/Employee';
import { AIEmployee } from '../models/AIEmployee';
import { requireAuth, type AuthUser } from './authRoutes';

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

    const task = await Task.findOne({ _id: id, companyCode });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    task.status = status;
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Status changed to ${status}`,
      performedBy: performedBy || 'Team Member'
    });

    await task.save();

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: performedBy || 'Team Member',
      actorType: 'human',
      action: `moved task to ${status}`,
      target: task.title,
      category: 'task'
    });

    res.json(task);
  } catch (error) {
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

    const task = await Task.findOne({ _id: id, companyCode });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const submission = task.submissions.find((s: ITaskSubmission) => s.id === submissionId);
    if (submission) {
      submission.reviewStatus = decision;
      submission.reviewedBy = reviewedBy || 'Founder';
      submission.reviewedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      submission.reviewNotes = notes || '';
    }

    task.status = decision === 'approved' ? 'COMPLETED' : 'IN_PROGRESS';
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: decision === 'approved' 
        ? `Submission APPROVED & task marked COMPLETED (${notes})` 
        : `Changes requested: "${notes}"`,
      performedBy: reviewedBy || 'Founder'
    });

    await task.save();

    if (decision === 'approved') {
      if (task.assigneeType === 'human') {
        await Employee.findOneAndUpdate(
          { name: task.assigneeName, companyCode },
          { $inc: { tasksCompleted: 1, tasksInProgress: -1 } }
        );
      } else {
        await AIEmployee.findOneAndUpdate(
          { name: task.assigneeName, companyCode },
          { $inc: { tasksCompleted: 1, tasksRunning: -1 } }
        );
      }
    }

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: reviewedBy || 'Founder',
      actorType: 'founder',
      action: decision === 'approved' ? 'approved & completed' : 'requested revisions on',
      target: task.title,
      category: 'review'
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

export default router;
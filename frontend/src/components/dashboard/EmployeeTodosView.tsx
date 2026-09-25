import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { Task } from '../../types';

export const EmployeeTodosView: React.FC = () => {
  const { 
    tasks, 
    updateTaskStatus, 
    setSelectedTask, 
    setIsCreateTaskModalOpen,
    auth
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'today' | 'in_progress' | 'completed' | 'all'>('today');

  const user = auth.phase === 'authenticated' ? auth.user : null;

  const myTasks = user
    ? tasks.filter(t => {
        if (t.assigneeName?.toLowerCase() === user.name.toLowerCase()) return true;
        if (user.role === 'founder' || user.role === 'co_founder') {
          return t.assigneeType === 'human' || (t.creatorName?.toLowerCase() ?? '').includes(user.name.toLowerCase());
        }
        return false;
      })
    : [];
  
  const filteredTasks = myTasks.filter(task => {
    if (activeFilter === 'today') return task.status !== 'COMPLETED';
    if (activeFilter === 'in_progress') return task.status === 'IN_PROGRESS' || task.status === 'SUBMITTED';
    if (activeFilter === 'completed') return task.status === 'COMPLETED';
    return true;
  });

  const isEmployee = user?.role === 'employee';

  const completedCount = myTasks.filter(t => t.status === 'COMPLETED').length;
  const totalCount = myTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-[30px_36px_44px] max-w-5xl">
      <div className="flex justify-between items-baseline border-b border-[var(--ink)] pb-4 mb-6">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            My Todos — <em>What do I need to do now?</em>
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Focus mode for today's high-leverage deliverables. Execute and submit for manager review.
          </p>
        </div>

        <div className="font-mono-custom text-[11px] text-[var(--muted)] text-right">
          Completion: <b className="text-[var(--good)]">{completedCount} / {totalCount} ({progressPercent}%)</b>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-[var(--rule)] pb-3 mb-6 font-mono-custom text-[11px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-2.5 py-1 transition ${
              activeFilter === 'today' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Today's Focus ({myTasks.filter(t => t.status !== 'COMPLETED').length})
          </button>
          <button
            onClick={() => setActiveFilter('in_progress')}
            className={`px-2.5 py-1 transition ${
              activeFilter === 'in_progress' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            In Progress ({myTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'SUBMITTED').length})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-2.5 py-1 transition ${
              activeFilter === 'completed' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 transition ${
              activeFilter === 'all' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            All Tasks
          </button>
        </div>

        {!isEmployee && (
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="px-3 py-1 font-mono-custom text-[11px] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
        >
          + Add Task
        </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 border border-[var(--rule)] bg-[var(--panel)] p-6 font-serif-body italic text-[14px] text-[var(--muted)]">
            No pending items on file for this selection. All caught up.
          </div>
        ) : (
          filteredTasks.map((task: Task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isSubmitted = task.status === 'SUBMITTED';

            return (
              <div
                key={task.id}
                className={`p-4 border transition ${
                  isCompleted 
                    ? 'border-[var(--rule)] bg-[var(--paper)] opacity-60' 
                    : 'border-[var(--ink)] bg-[var(--panel)] shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        if (isCompleted) {
                          updateTaskStatus(task.id, 'IN_PROGRESS');
                        } else {
                          setSelectedTask(task);
                        }
                      }}
                      className="mt-0.5 text-[15px] font-mono-custom text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      {isCompleted ? '☑' : '☐'}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 
                          onClick={() => setSelectedTask(task)}
                          className={`font-serif-body font-bold text-[15px] cursor-pointer hover:text-[var(--accent)] transition m-0 ${
                            isCompleted ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'
                          }`}
                        >
                          {task.title}
                        </h4>

                        <span className="font-mono-custom text-[10px] text-[var(--muted)]">
                          [{task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}] · [{task.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}]
                        </span>
                      </div>

                      <p className="font-serif-body italic text-[13px] text-[var(--muted)] m-0">
                        {task.description}
                      </p>

                      <div className="font-mono-custom text-[10px] text-[var(--muted)] pt-1 flex items-center gap-3">
                        <span>Due {task.deadline}</span>
                        <span>·</span>
                        <span>By {task.creatorName}</span>
                        {task.goalTitle && (
                          <>
                            <span>·</span>
                            <span className="text-[var(--accent)] font-medium">🎯 {task.goalTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 font-mono-custom text-[11px]">
                    {!isCompleted && !isSubmitted && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-1 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition font-medium"
                      >
                        Submit Work &rarr;
                      </button>
                    )}
                    {isSubmitted && (
                      <span className="text-[var(--accent)] font-semibold">
                        Under Review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

interface MonthBucket {
  human: number;
  ai: number;
  count: number;
}

export const ReportsView: React.FC = () => {
  const { tasks, goals, aiEmployees, humanEmployees, departments, auth } = useApp();
  const [range, setRange] = useState<'monthly' | 'yearly'>('monthly');

  const isEmployee = auth.phase === 'authenticated' && auth.user.role === 'employee';
  const scopeDept = isEmployee ? auth.user.department : undefined;

  const scopedTasks = scopeDept ? tasks.filter(t => t.department === scopeDept) : tasks;
  const scopedGoals = scopeDept ? goals.filter(g => g.department === scopeDept) : goals;
  const scopedAI = scopeDept ? aiEmployees.filter(a => a.department === scopeDept) : aiEmployees;
  const scopedHumans = scopeDept ? humanEmployees.filter(h => h.department === scopeDept) : humanEmployees;
  const visibleDepts = scopeDept ? departments.filter(d => d.name === scopeDept) : departments;

  const completed = scopedTasks.filter(t => t.status === 'COMPLETED').length;
  const goalsDone = scopedGoals.filter(g => g.status === 'completed').length;
  const aiDeliverables = scopedAI.reduce((sum, a) => sum + (a.tasksCompleted ?? 0), 0);

  const byMonth = scopedTasks.reduce<Record<string, MonthBucket>>((acc, t) => {
    const key = t.createdAt ? t.createdAt.slice(0, 7) : 'unknown';
    const entry = (acc[key] ??= { human: 0, ai: 0, count: 0 });
    entry.count += 1;
    if (t.assigneeType === 'ai') entry.ai += 1;
    else entry.human += 1;
    return acc;
  }, {});

  const months = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .reverse();

  return (
    <div className="p-[30px_36px_44px] max-w-6xl">
      <div className="flex justify-between items-baseline border-b border-[var(--ink)] pb-4 mb-6">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            Velocity &amp; Retrospective Reports
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            {isEmployee ? `Execution snapshot for ${scopeDept} — human vs AI throughput inside your department.` : 'Historical company execution, departmental milestones, and Human vs AI throughput.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono-custom text-[11px]">
          <button
            onClick={() => setRange('monthly')}
            className={`px-3 py-1 ${
              range === 'monthly' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border border-[var(--rule)] text-[var(--muted)]'
            }`}
            type="button"
          >
            Monthly
          </button>
          <button
            onClick={() => setRange('yearly')}
            className={`px-3 py-1 ${
              range === 'yearly' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border border-[var(--rule)] text-[var(--muted)]'
            }`}
            type="button"
          >
            Yearly 2026
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)]">Total Completed</div>
          <div className="font-serif-display font-bold text-[36px] text-[var(--ink)]">{completed}</div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Live from task board</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)]">Active Workforce</div>
          <div className="font-serif-display font-bold text-[36px] text-[var(--ink)]">{scopedHumans.length} + {scopedAI.length}</div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Humans &amp; AI in tandem</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)]">Goals Completed</div>
          <div className="font-serif-display font-bold text-[36px] text-[var(--good)]">{goalsDone} / {scopedGoals.length}</div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">OKR milestones closed</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)]">AI Deliverables</div>
          <div className="font-serif-display font-bold text-[36px] text-[var(--accent)]">{aiDeliverables}</div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Tasks completed by AI agents</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Output by Month
          </h3>

          {months.length === 0 ? (
            <p className="font-serif-body italic text-[13px] text-[var(--muted)] m-0 pt-2">
              No tasks logged yet this period.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {months.map(([month, m]) => (
                <div key={month} className="space-y-1 font-mono-custom text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--ink)] font-semibold">{month}</span>
                    <span className="font-bold">{m.count} {m.count === 1 ? 'task' : 'tasks'}</span>
                  </div>
                  {m.count > 0 && (
                    <>
                      <div className="w-full bg-[var(--paper)] h-2 border border-[var(--ink)] flex">
                        <div style={{ width: `${(m.human / m.count) * 100}%` }} className="bg-[var(--ink)] h-full" />
                        <div style={{ width: `${(m.ai / m.count) * 100}%` }} className="bg-[var(--accent)] h-full" />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--muted)]">
                        <span>Human: {m.human}</span>
                        <span className="text-[var(--accent)]">AI Workforce: {m.ai}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Departmental Velocity
          </h3>

          <div className="space-y-3 pt-2">
            {visibleDepts.map(dept => (
              <div key={dept.id} className="p-3 bg-[var(--paper)] border border-[var(--rule)] flex justify-between items-center">
                <div>
                  <div className="font-serif-body font-bold text-[15px] text-[var(--ink)]">{dept.name}</div>
                  <div className="font-serif-body italic text-[12px] text-[var(--muted)]">Lead: {dept.lead}</div>
                </div>
                <div className="text-right font-mono-custom">
                  <div className="text-[16px] font-bold text-[var(--good)]">{dept.progress}% OKR</div>
                  <div className="text-[10px] text-[var(--muted)]">{dept.memberCount} Staff + {dept.aiCount} AI</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
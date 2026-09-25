import React from 'react';
import { useApp } from '../../context/useApp';

export const EmployeeDashboard: React.FC = () => {
  const { tasks, goals, aiEmployees, humanEmployees, departments, auth, setActiveView, setSelectedTask } = useApp();

  const user = auth.phase === 'authenticated' ? auth.user : null;
  const dept = user?.department || '';
  const joined = departments.find(d => d.name === dept) || departments.find(d => d.name === user?.department);

  const deptTasks = tasks.filter(t => t.department === dept);
  const deptGoals = goals.filter(g => g.department === dept);
  const deptAI = aiEmployees.filter(a => a.department === dept);
  const deptHumans = humanEmployees.filter(h => h.department === dept);

  const myOpenTasks = user
    ? tasks.filter(t => t.assigneeName?.toLowerCase() === user.name.toLowerCase() && t.status !== 'COMPLETED')
    : [];

  const completedCount = deptTasks.filter(t => t.status === 'COMPLETED').length;
  const runningCount = deptAI.filter(a => a.status === 'running').length;
  const avgGoalProgress = deptGoals.length
    ? Math.round(deptGoals.reduce((sum, g) => sum + g.progressPercent, 0) / deptGoals.length)
    : 0;
  const urgentCount = deptTasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length;

  return (
    <div className="p-[30px_36px_44px] max-w-6xl">
      <div className="border border-[var(--ink)] bg-[var(--panel)] p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="font-mono-custom text-[11px] text-[var(--accent)] font-bold tracking-[0.18em]">
            YOUR DEPARTMENT
          </div>
          <div className="font-serif-display italic font-extrabold text-[32px] text-[var(--ink)] leading-tight">
            {dept || 'Unassigned'}
          </div>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Dept Lead: <b className="text-[var(--ink)]">{joined?.lead || '—'}</b> ·{' '}
            {deptHumans.length} human teammate{deptHumans.length === 1 ? '' : 's'} ·{' '}
            {deptAI.length} AI agent{deptAI.length === 1 ? '' : 's'} assigned
          </p>
        </div>
        <div className="font-mono-custom text-[11px] text-right shrink-0 leading-loose">
          <div>Department OKR: <b className="text-[var(--good)]">{joined?.progress ?? 0}%</b></div>
          <div>{joinNames(deptHumans.slice(0, 4).map(h => h.name))}</div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[36px] gap-y-[22px] mb-[36px]">
        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Dept Tasks on file
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--ink)]">
            <em>{deptTasks.length}</em>
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Dept Completed
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--good)]">
            {completedCount}
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            My Open Tasks
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--ink)]">
            <em>{myOpenTasks.length}</em>
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Dept AI Agents
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--ink)]">
            <em>{deptAI.length}</em>
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">{runningCount} live now</div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Dept Goal Progress
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--good)]">
            {avgGoalProgress}%
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            My Pending Submissions
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--bad)]">
            {urgentCount}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-baseline border-b border-[var(--rule)] pb-2 mb-2">
          <h3 className="m-0 font-serif-display italic font-bold text-[20px] text-[var(--ink)]">
            My Work Queue
          </h3>
          <button
            onClick={() => setActiveView('todos')}
            className="font-mono-custom text-[11px] text-[var(--accent)] font-bold hover:underline"
          >
            Open My Todos →
          </button>
        </div>

        {myOpenTasks.length === 0 ? (
          <div className="text-center py-10 border border-[var(--rule)] bg-[var(--panel)] p-6 font-serif-body italic text-[14px] text-[var(--muted)]">
            No open deliverables assigned to you right now. All caught up.
          </div>
        ) : (
          myOpenTasks.slice(0, 5).map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="p-4 border border-[var(--ink)] bg-[var(--panel)] shadow-xs cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-serif-body font-bold text-[15px] text-[var(--ink)] m-0">
                    {task.title}
                  </h4>
                  <p className="font-serif-body italic text-[13px] text-[var(--muted)] m-0 line-clamp-1">
                    {task.description}
                  </p>
                </div>
                <span className={`shrink-0 font-mono-custom text-[10px] px-1.5 py-0.5 border font-bold ${
                  task.priority === 'URGENT' ? 'border-[var(--bad)] text-[var(--bad)]' : 'border-[var(--rule)] text-[var(--muted)]'
                }`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-3 border-t border-[var(--rule)] font-mono-custom text-[10px] text-[var(--muted)]">
                <span>[{task.status.split('_').join(' ')}]</span>
                <span>Due {task.deadline}</span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

const joinNames = (names: string[]): string =>
  names.length ? names.join(' · ') : '';
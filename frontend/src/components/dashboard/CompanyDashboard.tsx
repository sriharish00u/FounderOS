import React from 'react';
import { useApp } from '../../context/useApp';

export const CompanyDashboard: React.FC = () => {
  const { tasks, aiEmployees, goals } = useApp();

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'SUBMITTED' || t.status === 'REVIEW').length;
  const urgentCount = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length;
  const runningCount = aiEmployees.filter(a => a.status === 'running').length;
  const avgGoalProgress = goals.length ? Math.round(goals.reduce((sum, g) => sum + g.progressPercent, 0) / goals.length) : 0;

  return (
    <div className="p-[30px_36px_44px] max-w-6xl">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[36px] gap-y-[22px] mb-[36px]">
        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Tasks on file
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--ink)]">
            <em>{tasks.length}</em>
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Completed
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--good)]">
            {completedCount}
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            In Progress
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--ink)]">
            <em>{inProgressCount}</em>
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            AI Agents Deployed
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--ink)]">
            <em>{aiEmployees.length}</em>
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">{runningCount} live now</div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Avg Goal Progress
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--good)]">
            {avgGoalProgress}%
          </div>
        </div>

        <div className="p-[4px_0_14px] border-b border-[var(--rule)]">
          <div className="font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.18em] mb-1.5">
            Urgent / Overdue
          </div>
          <div className="font-serif-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.01em] tnum mb-1.5 text-[var(--bad)]">
            {urgentCount}
          </div>
        </div>
      </section>
    </div>
  );
};
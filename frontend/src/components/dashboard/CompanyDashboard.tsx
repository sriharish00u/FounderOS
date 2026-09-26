import React from 'react';
import { useApp } from '../../context/useApp';
import { useExecutiveBriefingQuery } from '../../hooks/queries';
import type { ActiveView } from '../../context/AppContextInstance';

export const CompanyDashboard: React.FC = () => {
  const { tasks, aiEmployees, goals, setActiveView, setSelectedTaskId, setIsTaskDetailModalOpen } =
    useApp();
  const { data: briefing, isLoading: isBriefingLoading } = useExecutiveBriefingQuery();

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressCount = tasks.filter(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'SUBMITTED' || t.status === 'REVIEW'
  ).length;
  const urgentCount = tasks.filter(
    (t) => t.priority === 'URGENT' && t.status !== 'COMPLETED'
  ).length;
  const runningCount = aiEmployees.filter((a) => a.status === 'running').length;
  const avgGoalProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercent, 0) / goals.length)
    : 0;

  const handleAction = (type?: string, targetId?: string) => {
    if (type === 'open_task' && targetId) {
      setSelectedTaskId(targetId);
      setIsTaskDetailModalOpen(true);
    } else if (type === 'navigate_crm') {
      setActiveView('crm' as ActiveView);
    } else if (type === 'navigate_finance') {
      setActiveView('finance' as ActiveView);
    }
  };

  return (
    <div className="p-[30px_36px_44px] max-w-7xl space-y-8">
      {/* 1. FOUNDEROS DAILY EXECUTIVE BRIEFING (COMMAND CENTER) */}
      <div className="border-2 border-[var(--ink)] bg-[var(--panel)] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-[var(--ink)] pb-4 gap-2">
          <div>
            <div className="font-mono-custom text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">
              Executive Daily Briefing · Understand ➔ Decide ➔ Act
            </div>
            <h1 className="font-serif-display font-extrabold text-[32px] text-[var(--ink)] m-0 mt-1">
              Founder Command Center
            </h1>
          </div>
          <div className="font-mono-custom text-[11px] text-[var(--muted)]">
            {briefing?.date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {isBriefingLoading ? (
          <div className="py-6 text-center font-mono-custom text-[11px] text-[var(--muted)]">
            Synthesizing cross-pillar intelligence…
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Critical Attentions & Today's Priorities (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Critical Attentions */}
              {briefing && briefing.criticalAttentions.length > 0 && (
                <div className="space-y-3">
                  <div className="font-mono-custom text-[11px] uppercase text-[var(--bad)] font-bold tracking-wider flex items-center gap-1.5">
                    <span>🚨</span> Attention Required ({briefing.criticalAttentions.length})
                  </div>
                  <div className="space-y-2.5">
                    {briefing.criticalAttentions.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[var(--paper)] border border-[var(--bad)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div>
                          <div className="font-serif-body font-bold text-[14.5px] text-[var(--ink)]">
                            {item.title}
                          </div>
                          <p className="font-serif-body italic text-[12.5px] text-[var(--muted)] m-0 mt-0.5">
                            {item.message}
                          </p>
                        </div>
                        {item.actionLabel && (
                          <button
                            onClick={() => handleAction(item.actionType, item.targetId)}
                            className="shrink-0 px-3 py-1 font-mono-custom text-[10px] uppercase tracking-wider bg-[var(--bad)] text-[var(--paper)] font-bold hover:opacity-90 transition"
                            type="button"
                          >
                            {item.actionLabel} →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top 3 Priorities for Today */}
              <div className="space-y-3">
                <div className="font-mono-custom text-[11px] uppercase text-[var(--ink)] font-bold tracking-wider flex items-center gap-1.5">
                  <span>🎯</span> Top 3 Priorities for Today
                </div>
                <div className="space-y-2.5">
                  {briefing?.topPriorities.map((prio) => (
                    <div
                      key={prio.id}
                      className="p-3.5 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--ink)] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-mono-custom text-[11px] font-bold shrink-0 mt-0.5">
                          {prio.rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-custom text-[9px] uppercase px-1.5 py-0.2 bg-[var(--panel)] border border-[var(--rule)] text-[var(--muted)]">
                              {prio.category}
                            </span>
                            <span className="font-serif-body font-bold text-[14.5px] text-[var(--ink)]">
                              {prio.title}
                            </span>
                          </div>
                          <p className="font-serif-body italic text-[12.5px] text-[var(--muted)] m-0 mt-1">
                            {prio.context}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveView(prio.targetView as ActiveView)}
                        className="shrink-0 px-3 py-1 font-mono-custom text-[10px] uppercase tracking-wider bg-[var(--ink)] text-[var(--paper)] font-bold hover:bg-[var(--accent)] transition"
                        type="button"
                      >
                        {prio.actionLabel} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: 5-Pillar Executive Pulse (4 cols) */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[var(--rule)] pt-6 lg:pt-0 lg:pl-6 space-y-4">
              <div className="font-mono-custom text-[11px] uppercase text-[var(--muted)] tracking-wider font-bold">
                5-Pillar Executive Pulse
              </div>

              <div className="space-y-3 font-serif-body text-[13px]">
                {/* 1. CRM */}
                <div
                  onClick={() => setActiveView('crm' as ActiveView)}
                  className="p-3 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--accent)] transition cursor-pointer"
                >
                  <div className="flex justify-between font-mono-custom text-[10px] text-[var(--muted)] uppercase">
                    <span>1. CRM &amp; Pipeline</span>
                    <span className="text-[var(--accent)] font-bold">Open</span>
                  </div>
                  <div className="font-serif-display font-bold text-[20px] text-[var(--ink)] mt-0.5">
                    ${briefing?.pillarHealth.crm.pipelineValue.toLocaleString() || '0'}
                  </div>
                  <div className="font-mono-custom text-[10px] text-[var(--muted)]">
                    {briefing?.pillarHealth.crm.openDeals || 0} active deals · {briefing?.pillarHealth.crm.stalledDeals || 0} stalled
                  </div>
                </div>

                {/* 2. Finance */}
                <div
                  onClick={() => setActiveView('finance' as ActiveView)}
                  className="p-3 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--accent)] transition cursor-pointer"
                >
                  <div className="flex justify-between font-mono-custom text-[10px] text-[var(--muted)] uppercase">
                    <span>2. Finance &amp; Runway</span>
                    <span className="text-[var(--good)] font-bold">Live</span>
                  </div>
                  <div className="font-serif-display font-bold text-[20px] text-[var(--good)] mt-0.5">
                    {briefing?.pillarHealth.finance.runwayMonths || 0} mos runway
                  </div>
                  <div className="font-mono-custom text-[10px] text-[var(--muted)]">
                    ${briefing?.pillarHealth.finance.cashBalance.toLocaleString() || '0'} cash reserves
                  </div>
                </div>

                {/* 3. Projects */}
                <div
                  onClick={() => setActiveView('tasks' as ActiveView)}
                  className="p-3 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--accent)] transition cursor-pointer"
                >
                  <div className="flex justify-between font-mono-custom text-[10px] text-[var(--muted)] uppercase">
                    <span>3. Projects &amp; Delivery</span>
                    <span className="text-[var(--ink)] font-bold">Track</span>
                  </div>
                  <div className="font-serif-display font-bold text-[20px] text-[var(--ink)] mt-0.5">
                    {briefing?.pillarHealth.projects.inReview || 0} in review
                  </div>
                  <div className="font-mono-custom text-[10px] text-[var(--muted)]">
                    {briefing?.pillarHealth.projects.totalTasks || 0} total tasks on board
                  </div>
                </div>

                {/* 4. Strategy */}
                <div
                  onClick={() => setActiveView('strategy' as ActiveView)}
                  className="p-3 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--accent)] transition cursor-pointer"
                >
                  <div className="flex justify-between font-mono-custom text-[10px] text-[var(--muted)] uppercase">
                    <span>4. Strategy &amp; OKRs</span>
                    <span className="text-[var(--accent)] font-bold">Target</span>
                  </div>
                  <div className="font-serif-display font-bold text-[20px] text-[var(--accent)] mt-0.5">
                    {briefing?.pillarHealth.strategy.avgGoalProgress || 0}% velocity
                  </div>
                  <div className="font-mono-custom text-[10px] text-[var(--muted)]">
                    Across {briefing?.pillarHealth.strategy.totalGoals || 0} strategic milestones
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CLASSIC KPI STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[36px] gap-y-[22px]">
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

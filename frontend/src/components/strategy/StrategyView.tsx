import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { useDecisionsQuery, useCreateDecisionMutation } from '../../hooks/queries';
import type { DecisionCategory } from '../../types';

export const StrategyView: React.FC = () => {
  const { goals, setIsCreateGoalModalOpen } = useApp();
  const { data: decisions = [], isLoading: isDecisionsLoading } = useDecisionsQuery();
  const createDecisionMutation = useCreateDecisionMutation();

  const [activeTab, setActiveTab] = useState<'okrs' | 'decisions'>('okrs');
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const [decisionForm, setDecisionForm] = useState({
    title: '',
    category: 'Strategy' as DecisionCategory,
    context: '',
    decision: '',
    rationale: '',
    impact: '',
    stakeholders: '',
  });

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionForm.title || !decisionForm.context || !decisionForm.decision) return;

    await createDecisionMutation.mutateAsync({
      title: decisionForm.title,
      category: decisionForm.category,
      context: decisionForm.context,
      decision: decisionForm.decision,
      rationale: decisionForm.rationale,
      impact: decisionForm.impact,
      stakeholders: decisionForm.stakeholders
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      ownerName: 'Founder',
    });

    setIsDecisionModalOpen(false);
    setDecisionForm({
      title: '',
      category: 'Strategy',
      context: '',
      decision: '',
      rationale: '',
      impact: '',
      stakeholders: '',
    });
  };

  const avgProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercent, 0) / goals.length)
    : 0;

  return (
    <div className="p-[30px_36px_44px] max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-[var(--ink)] pb-4 mb-6 gap-4">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            Strategy &amp; Decision Register
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Company-level OKRs, milestone trajectory tracking, and corporate architectural decision records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-[var(--ink)] font-mono-custom text-[11px]">
            <button
              onClick={() => setActiveTab('okrs')}
              className={`px-3 py-1 ${
                activeTab === 'okrs'
                  ? 'bg-[var(--ink)] text-[var(--paper)] font-bold'
                  : 'bg-[var(--paper)] text-[var(--muted)]'
              }`}
              type="button"
            >
              Strategic OKRs ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('decisions')}
              className={`px-3 py-1 border-l border-[var(--ink)] ${
                activeTab === 'decisions'
                  ? 'bg-[var(--ink)] text-[var(--paper)] font-bold'
                  : 'bg-[var(--paper)] text-[var(--muted)]'
              }`}
              type="button"
            >
              Decision Log ({decisions.length})
            </button>
          </div>

          {activeTab === 'okrs' ? (
            <button
              onClick={() => setIsCreateGoalModalOpen(true)}
              className="px-3.5 py-1 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
              type="button"
            >
              + New OKR
            </button>
          ) : (
            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="px-3.5 py-1 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
              type="button"
            >
              + Log Decision
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Strategic OKRs */}
      {activeTab === 'okrs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
              <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
                Average OKR Progress
              </div>
              <div className="font-serif-display font-bold text-[32px] text-[var(--good)]">
                {avgProgress}%
              </div>
              <div className="font-mono-custom text-[10px] text-[var(--muted)]">Across all departments</div>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
              <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
                Active Strategic Goals
              </div>
              <div className="font-serif-display font-bold text-[32px] text-[var(--ink)]">
                {goals.length}
              </div>
              <div className="font-mono-custom text-[10px] text-[var(--muted)]">Q3/Q4 Target Vector</div>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
              <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
                Completed Milestones
              </div>
              <div className="font-serif-display font-bold text-[32px] text-[var(--accent)]">
                {goals.filter((g) => g.status === 'completed').length}
              </div>
              <div className="font-mono-custom text-[10px] text-[var(--muted)]">Closed milestones</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="border border-[var(--ink)] bg-[var(--panel)] p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono-custom text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[var(--paper)] border border-[var(--rule)] text-[var(--muted)]">
                      {goal.department}
                    </span>
                    <span
                      className={`font-mono-custom text-[10px] uppercase font-bold px-2 py-0.5 border ${
                        goal.status === 'completed'
                          ? 'bg-[var(--good)]/10 text-[var(--good)] border-[var(--good)]'
                          : goal.status === 'at_risk' || goal.status === 'behind'
                          ? 'bg-[var(--bad)]/10 text-[var(--bad)] border-[var(--bad)]'
                          : 'bg-[var(--ink)]/10 text-[var(--ink)] border-[var(--ink)]'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-[20px] text-[var(--ink)] mt-2.5 mb-1 leading-snug">
                    {goal.title}
                  </h3>
                  <p className="font-serif-body italic text-[13px] text-[var(--muted)] m-0">
                    Target Metric: {goal.targetMetric} ({goal.currentValue} / {goal.targetValue})
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--rule)]">
                  <div className="flex justify-between font-mono-custom text-[11px]">
                    <span className="text-[var(--muted)]">Target Velocity</span>
                    <span className="font-bold text-[var(--ink)]">{goal.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[var(--paper)] h-2 border border-[var(--rule)]">
                    <div
                      style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                      className={`h-full ${
                        goal.progressPercent >= 70 ? 'bg-[var(--good)]' : 'bg-[var(--accent)]'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between font-mono-custom text-[10px] text-[var(--muted)] pt-1">
                    <span>Lead: {goal.ownerName}</span>
                    <span>Deadline: {goal.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Decision Register */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          {isDecisionsLoading ? (
            <div className="py-8 text-center font-mono-custom text-[11px] text-[var(--muted)]">
              Loading Corporate Decision Register…
            </div>
          ) : (
            <div className="space-y-4">
              {decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3 font-serif-body"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--rule)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-custom text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[var(--ink)] text-[var(--paper)] font-bold">
                        {dec.category}
                      </span>
                      <h3 className="font-serif-display font-bold text-[18px] text-[var(--ink)] m-0">
                        {dec.title}
                      </h3>
                    </div>
                    <div className="font-mono-custom text-[11px] text-[var(--muted)]">
                      Decided {dec.date} by {dec.ownerName}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px] pt-1">
                    <div>
                      <div className="font-mono-custom text-[10px] uppercase text-[var(--muted)] font-bold tracking-wider mb-1">
                        1. Context &amp; Trigger
                      </div>
                      <p className="m-0 text-[var(--muted)] italic leading-relaxed">{dec.context}</p>
                    </div>

                    <div>
                      <div className="font-mono-custom text-[10px] uppercase text-[var(--accent)] font-bold tracking-wider mb-1">
                        2. The Decision
                      </div>
                      <p className="m-0 font-bold text-[var(--ink)] leading-relaxed">{dec.decision}</p>
                    </div>

                    <div>
                      <div className="font-mono-custom text-[10px] uppercase text-[var(--good)] font-bold tracking-wider mb-1">
                        3. Rationale &amp; Impact
                      </div>
                      <p className="m-0 text-[var(--ink)] leading-relaxed">{dec.rationale}</p>
                    </div>
                  </div>

                  {dec.stakeholders && dec.stakeholders.length > 0 && (
                    <div className="pt-2 border-t border-[var(--rule)] flex items-center justify-between font-mono-custom text-[10px] text-[var(--muted)]">
                      <span>Stakeholders: {dec.stakeholders.join(', ')}</span>
                      <span className="uppercase text-[var(--good)] font-bold">● Active Status</span>
                    </div>
                  )}
                </div>
              ))}
              {decisions.length === 0 && (
                <div className="p-8 border border-[var(--rule)] bg-[var(--panel)] text-center font-serif-body italic text-[var(--muted)]">
                  No architectural or corporate decisions recorded yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Log Decision Modal */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateDecision}
            className="bg-[var(--paper)] border border-[var(--ink)] max-w-lg w-full p-6 space-y-4 shadow-2xl font-serif-body"
          >
            <div className="flex justify-between items-center border-b border-[var(--ink)] pb-3">
              <h3 className="font-serif-display font-bold text-[20px] text-[var(--ink)] m-0">
                Log Corporate Decision
              </h3>
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Title *
                </label>
                <input
                  required
                  value={decisionForm.title}
                  onChange={(e) => setDecisionForm({ ...decisionForm, title: e.target.value })}
                  placeholder="e.g. Migrate to Microservices"
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
                />
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Category
                </label>
                <select
                  value={decisionForm.category}
                  onChange={(e) =>
                    setDecisionForm({
                      ...decisionForm,
                      category: e.target.value as DecisionCategory,
                    })
                  }
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[12px] font-mono-custom"
                >
                  <option value="Strategy">Strategy</option>
                  <option value="Product">Product</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Hiring">Hiring</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                Context &amp; Background *
              </label>
              <textarea
                required
                rows={2}
                value={decisionForm.context}
                onChange={(e) => setDecisionForm({ ...decisionForm, context: e.target.value })}
                placeholder="What problem or inflection point required this decision?"
                className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
              />
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                The Decision *
              </label>
              <textarea
                required
                rows={2}
                value={decisionForm.decision}
                onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                placeholder="What specific path or policy was chosen?"
                className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
              />
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                Rationale &amp; Expected Impact *
              </label>
              <textarea
                required
                rows={2}
                value={decisionForm.rationale}
                onChange={(e) => setDecisionForm({ ...decisionForm, rationale: e.target.value })}
                placeholder="Why is this the superior option and what will it achieve?"
                className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--rule)]">
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-3 py-1.5 border border-[var(--rule)] font-mono-custom text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDecisionMutation.isPending}
                className="px-4 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-mono-custom text-[11px] font-bold shadow-sm"
              >
                {createDecisionMutation.isPending ? 'Logging…' : 'Record Decision'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

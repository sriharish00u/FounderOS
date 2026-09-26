import React, { useState } from 'react';
import {
  useCRMQuery,
  useCreateDealMutation,
  useUpdateDealStageMutation,
  useGenerateDealOutreachMutation,
} from '../../hooks/queries';
import type { Deal, DealStage } from '../../types';

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'LEAD', label: '1. Lead Inbound', color: 'border-[var(--muted)]' },
  { id: 'QUALIFIED', label: '2. Discovery & Qualified', color: 'border-[var(--ink)]' },
  { id: 'PROPOSAL', label: '3. Proposal Sent', color: 'border-[var(--accent)]' },
  { id: 'NEGOTIATION', label: '4. Negotiation', color: 'border-[#d97706]' },
  { id: 'WON', label: '5. Closed / Won', color: 'border-[var(--good)]' },
  { id: 'LOST', label: 'Closed / Lost', color: 'border-[var(--bad)]' },
];

export const CRMView: React.FC = () => {
  const { data, isLoading } = useCRMQuery();
  const createDealMutation = useCreateDealMutation();
  const updateStageMutation = useUpdateDealStageMutation();
  const generateOutreachMutation = useGenerateDealOutreachMutation();

  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [selectedDealForOutreach, setSelectedDealForOutreach] = useState<Deal | null>(null);
  const [outreachResult, setOutreachResult] = useState<{ subject: string; draft: string } | null>(
    null
  );

  const [newDealForm, setNewDealForm] = useState({
    title: '',
    clientName: '',
    contactEmail: '',
    value: '',
    stage: 'LEAD' as DealStage,
    probability: '50',
    notes: '',
  });

  const deals = data?.deals ?? [];
  const metrics = data?.metrics ?? {
    totalDeals: 0,
    openDealsCount: 0,
    pipelineValue: 0,
    wonValue: 0,
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealForm.title || !newDealForm.clientName) return;

    await createDealMutation.mutateAsync({
      title: newDealForm.title,
      clientName: newDealForm.clientName,
      contactEmail: newDealForm.contactEmail,
      value: Number(newDealForm.value) || 0,
      stage: newDealForm.stage,
      probability: Number(newDealForm.probability) || 50,
      ownerName: 'Founder',
      notes: newDealForm.notes,
      lastContactDate: new Date().toISOString().split('T')[0],
      followUpRequired: false,
    });

    setIsNewDealModalOpen(false);
    setNewDealForm({
      title: '',
      clientName: '',
      contactEmail: '',
      value: '',
      stage: 'LEAD',
      probability: '50',
      notes: '',
    });
  };

  const handleGenerateOutreach = async (deal: Deal) => {
    setSelectedDealForOutreach(deal);
    setOutreachResult(null);
    const res = await generateOutreachMutation.mutateAsync(deal.id);
    setOutreachResult(res);
  };

  const isStalled = (deal: Deal) => {
    if (!deal.lastContactDate || ['WON', 'LOST'].includes(deal.stage)) return false;
    const daysSince =
      (Date.now() - new Date(deal.lastContactDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 3;
  };

  return (
    <div className="p-[30px_36px_44px] max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-[var(--ink)] pb-4 mb-6 gap-4">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            CRM &amp; Client Pipeline
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Enterprise customer relationships, deal stages, and AI-assisted qualification outreach.
          </p>
        </div>

        <button
          onClick={() => setIsNewDealModalOpen(true)}
          className="px-4 py-1.5 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
          type="button"
        >
          + Add New Deal
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Total Pipeline Value
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--ink)]">
            ${metrics.pipelineValue.toLocaleString()}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Active opportunities</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Won Revenue (Closed)
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--good)]">
            ${metrics.wonValue.toLocaleString()}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Recognized revenue</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Open Deals
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--ink)]">
            {metrics.openDealsCount}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">In active negotiation</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Stalled Deals (3+ Days)
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--bad)]">
            {deals.filter(isStalled).length}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Require re-engagement</div>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="p-8 text-center font-mono-custom text-[12px] text-[var(--muted)]">
          Loading CRM Pipeline…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div
                key={stage.id}
                className={`bg-[var(--panel)] border-t-2 ${stage.color} border-x border-b border-[var(--rule)] p-3 flex flex-col min-h-[420px]`}
              >
                <div className="flex justify-between items-center pb-2 mb-3 border-b border-[var(--rule)]">
                  <div className="font-mono-custom text-[11px] font-bold text-[var(--ink)] truncate max-w-[120px]">
                    {stage.label}
                  </div>
                  <span className="font-mono-custom text-[10px] bg-[var(--paper)] px-1.5 py-0.5 border border-[var(--rule)]">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="font-mono-custom text-[10px] text-[var(--muted)] mb-3">
                  ${stageTotal.toLocaleString()}
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageDeals.map((deal) => {
                    const stalled = isStalled(deal);

                    return (
                      <div
                        key={deal.id}
                        className={`p-3 bg-[var(--paper)] border ${
                          stalled ? 'border-[var(--bad)] shadow-xs' : 'border-[var(--rule)]'
                        } flex flex-col justify-between gap-2`}
                      >
                        <div>
                          {stalled && (
                            <div className="font-mono-custom text-[9px] text-[var(--bad)] uppercase font-bold tracking-wider mb-1">
                              🚨 Stalled · 3+ Days Untouched
                            </div>
                          )}
                          <div className="font-serif-body font-bold text-[14px] text-[var(--ink)] leading-snug">
                            {deal.title}
                          </div>
                          <div className="font-mono-custom text-[11px] text-[var(--muted)] mt-0.5">
                            {deal.clientName}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--rule)] flex justify-between items-baseline">
                          <span className="font-serif-display font-bold text-[16px] text-[var(--ink)]">
                            ${deal.value.toLocaleString()}
                          </span>
                          <span className="font-mono-custom text-[10px] text-[var(--muted)]">
                            {deal.probability}% win
                          </span>
                        </div>

                        {/* Stage Mover */}
                        <div className="flex items-center gap-1 pt-1">
                          <select
                            value={deal.stage}
                            onChange={(e) =>
                              updateStageMutation.mutate({
                                id: deal.id,
                                stage: e.target.value as DealStage,
                              })
                            }
                            className="w-full text-[10px] font-mono-custom p-1 bg-[var(--panel)] border border-[var(--rule)] text-[var(--ink)]"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move: {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* AI Outreach Trigger */}
                        <button
                          onClick={() => handleGenerateOutreach(deal)}
                          className="w-full text-center py-1 font-mono-custom text-[9px] uppercase tracking-wider bg-[var(--panel)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition border border-[var(--rule)]"
                          type="button"
                        >
                          🤖 AI Outreach Draft
                        </button>
                      </div>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 font-serif-body italic text-[11px] text-[var(--muted)]">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Outreach Draft Modal */}
      {selectedDealForOutreach && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-lg w-full p-6 space-y-4 shadow-2xl font-serif-body">
            <div className="flex justify-between items-start border-b border-[var(--ink)] pb-3">
              <div>
                <h3 className="font-serif-display font-bold text-[20px] text-[var(--ink)] m-0">
                  AI Outreach Assistant
                </h3>
                <div className="font-mono-custom text-[11px] text-[var(--muted)]">
                  Target: {selectedDealForOutreach.clientName} ({selectedDealForOutreach.title})
                </div>
              </div>
              <button
                onClick={() => setSelectedDealForOutreach(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] text-[16px]"
                type="button"
              >
                ✕
              </button>
            </div>

            {generateOutreachMutation.isPending ? (
              <div className="py-8 text-center font-mono-custom text-[11px] text-[var(--muted)]">
                Synthesizing personalized outreach note…
              </div>
            ) : outreachResult ? (
              <div className="space-y-3">
                <div className="p-2 bg-[var(--panel)] border border-[var(--rule)] font-mono-custom text-[11px]">
                  <b className="text-[var(--ink)]">Subject:</b> {outreachResult.subject}
                </div>
                <div className="p-3 bg-[var(--panel)] border border-[var(--rule)] font-serif-body text-[13px] whitespace-pre-wrap leading-relaxed">
                  {outreachResult.draft}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(outreachResult.draft);
                      alert('Draft copied to clipboard!');
                    }}
                    className="px-3 py-1 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[11px] font-bold"
                    type="button"
                  >
                    Copy Draft to Clipboard
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {isNewDealModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateDeal}
            className="bg-[var(--paper)] border border-[var(--ink)] max-w-md w-full p-6 space-y-4 shadow-2xl font-serif-body"
          >
            <div className="flex justify-between items-center border-b border-[var(--ink)] pb-3">
              <h3 className="font-serif-display font-bold text-[20px] text-[var(--ink)] m-0">
                Add New Deal to CRM
              </h3>
              <button
                onClick={() => setIsNewDealModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
                type="button"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                Deal Title *
              </label>
              <input
                required
                value={newDealForm.title}
                onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
                placeholder="e.g. Enterprise License Deployment"
                className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Client / Account *
                </label>
                <input
                  required
                  value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  placeholder="e.g. Apex Retail"
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
                />
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Deal Value ($) *
                </label>
                <input
                  type="number"
                  required
                  value={newDealForm.value}
                  onChange={(e) => setNewDealForm({ ...newDealForm, value: e.target.value })}
                  placeholder="45000"
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={newDealForm.stage}
                  onChange={(e) =>
                    setNewDealForm({ ...newDealForm, stage: e.target.value as DealStage })
                  }
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[12px] font-mono-custom"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Win Probability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newDealForm.probability}
                  onChange={(e) => setNewDealForm({ ...newDealForm, probability: e.target.value })}
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                Context / Notes
              </label>
              <textarea
                rows={2}
                value={newDealForm.notes}
                onChange={(e) => setNewDealForm({ ...newDealForm, notes: e.target.value })}
                placeholder="Key stakeholders, requirements, and budget details..."
                className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--rule)]">
              <button
                type="button"
                onClick={() => setIsNewDealModalOpen(false)}
                className="px-3 py-1.5 border border-[var(--rule)] font-mono-custom text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDealMutation.isPending}
                className="px-4 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-mono-custom text-[11px] font-bold shadow-sm"
              >
                {createDealMutation.isPending ? 'Saving…' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

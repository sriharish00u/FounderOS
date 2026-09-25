import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

export const GoalsView: React.FC = () => {
  const { goals, createGoal, auth } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetMetric] = useState('Monthly Revenue');
  const [currentValue] = useState('₹6.8L');
  const [targetValue, setTargetValue] = useState('₹10.0L');
  const [progressPercent] = useState(68);
  const [deadline, setDeadline] = useState('2026-12-31');
  const [department] = useState('Engineering');

  const isEmployee = auth.phase === 'authenticated' && auth.user.role === 'employee';
  const scopeDept = isEmployee ? auth.user.department : undefined;
  const visibleGoals = scopeDept ? goals.filter(g => g.department === scopeDept) : goals;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createGoal({
      title,
      description,
      targetMetric,
      currentValue,
      targetValue,
      progressPercent: Number(progressPercent),
      deadline,
      ownerName: 'Sri Harish',
      ownerRole: 'Founder & CEO',
      department,
      status: 'on_track'
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="p-[30px_36px_44px] max-w-6xl">
      <div className="flex justify-between items-baseline border-b border-[var(--ink)] pb-4 mb-6">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            Strategic Goals &amp; OKR Framework
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            {isEmployee ? `"Department goals driving ${scopeDept} — every task should ladder to one of these."` : '"Goal → Target → Project → Tasks → People / AI → Completion → Growth"'}
          </p>
        </div>

        {!isEmployee && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
          >
            + Create Goal
          </button>
        )}
      </div>

      <div className="space-y-6">
        {visibleGoals.length === 0 ? (
          <div className="text-center py-12 border border-[var(--rule)] bg-[var(--panel)] p-6 font-serif-body italic text-[14px] text-[var(--muted)]">
            No goals on file for {scopeDept ?? 'this workspace'} yet.
          </div>
        ) : (
        visibleGoals.map(goal => (
          <div key={goal.id} className="border border-[var(--ink)] bg-[var(--panel)] p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-mono-custom text-[10px] text-[var(--good)] font-bold tracking-widest">
                  [ {goal.status.replace('_', ' ').toUpperCase()} ] · {goal.department}
                </div>
                <h3 className="font-serif-display italic font-bold text-[22px] text-[var(--ink)] m-0 mt-0.5">
                  {goal.title}
                </h3>
                <p className="font-serif-body italic text-[14px] text-[var(--muted)] m-0 mt-1">
                  {goal.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="font-serif-display font-bold text-[36px] text-[var(--ink)] leading-none">
                  {goal.progressPercent}%
                </div>
                <span className="font-mono-custom text-[11px] text-[var(--muted)]">
                  Metric: {goal.targetMetric}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono-custom text-[11px]">
                <span>Current: <b>{goal.currentValue}</b></span>
                <span>Target: <b>{goal.targetValue}</b></span>
              </div>
              <div className="w-full bg-[var(--paper)] h-2.5 border border-[var(--ink)]">
                <div 
                  className="bg-[var(--accent)] h-full"
                  style={{ width: `${goal.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--rule)] font-mono-custom text-[11px] text-[var(--muted)]">
              <span>Owner: <b>{goal.ownerName}</b> ({goal.ownerRole})</span>
              <span>Target Deadline: <b>{goal.deadline}</b></span>
            </div>
          </div>
        ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-lg shadow-2xl overflow-hidden text-[var(--ink)]">
            <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
              <h3 className="font-serif-display italic font-bold text-[22px] m-0">Create Strategic Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="font-mono-custom text-[12px] font-bold">
                [ Close ]
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 font-serif-body text-[13.5px]">
              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Reach ₹10L Monthly Recurring Revenue"
                  className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Target Value</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--rule)] font-mono-custom text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 border border-[var(--rule)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-bold shadow-sm"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

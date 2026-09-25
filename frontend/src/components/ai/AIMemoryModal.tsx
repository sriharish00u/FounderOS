import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

export const AIMemoryModal: React.FC = () => {
  const { 
    selectedAIEmployee, 
    isMemoryModalOpen, 
    setIsMemoryModalOpen,
    updateAIMemory 
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState(selectedAIEmployee?.memory.instructions || '');
  const [companyContext, setCompanyContext] = useState(selectedAIEmployee?.memory.companyContext || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isMemoryModalOpen || !selectedAIEmployee) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAIMemory(selectedAIEmployee.id, {
      instructions,
      companyContext,
      tokenCount: selectedAIEmployee.memory.tokenCount + 120
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 1500);
  };

  const mem = selectedAIEmployee.memory;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[var(--ink)]">
        <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
          <div>
            <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-widest">
              Organizational Memory Dossier
            </div>
            <h3 className="font-serif-display italic font-bold text-[24px] text-[var(--ink)] m-0">
              {selectedAIEmployee.name}
            </h3>
            <div className="font-mono-custom text-[11px] text-[var(--accent)] mt-0.5">
              {selectedAIEmployee.provider} · {selectedAIEmployee.model}
            </div>
          </div>

          <button
            onClick={() => setIsMemoryModalOpen(false)}
            className="font-mono-custom text-[12px] font-bold border border-[var(--ink)] px-2.5 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            [ Close ]
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-serif-body text-[14px]">
          <div className="grid grid-cols-3 gap-4 p-3 border border-[var(--rule)] bg-[var(--panel)] font-mono-custom text-[11px]">
            <div>
              <span className="text-[var(--muted)] block">Context Size:</span>
              <span className="text-[var(--ink)] font-bold text-[14px]">{mem.tokenCount} tokens</span>
            </div>
            <div>
              <span className="text-[var(--muted)] block">Completed Work:</span>
              <span className="text-[var(--good)] font-bold text-[14px]">{selectedAIEmployee.tasksCompleted} tasks</span>
            </div>
            <div>
              <span className="text-[var(--muted)] block">Last Synced:</span>
              <span className="text-[var(--ink)] font-bold">{mem.lastUpdated}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)] m-0">
              1. Identity &amp; Role Blueprint
            </h4>
            <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] italic text-[14px]">
              {mem.identitySummary}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)] m-0">
              2. Core Responsibilities
            </h4>
            <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] space-y-1">
              {mem.responsibilities.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-mono-custom text-[var(--accent)] font-bold">0{i+1}.</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <h4 className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)] m-0">
                3. Operating Directives &amp; Memory Rules
              </h4>
              {!isEditing && (
                <button
                  onClick={() => {
                    setInstructions(mem.instructions);
                    setCompanyContext(mem.companyContext);
                    setIsEditing(true);
                  }}
                  className="font-mono-custom text-[11px] text-[var(--accent)] hover:underline font-semibold"
                >
                  [ Edit Directives ]
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 p-3 border border-[var(--ink)] bg-[var(--panel)]">
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Company Context:</label>
                  <textarea
                    rows={2}
                    value={companyContext}
                    onChange={e => setCompanyContext(e.target.value)}
                    className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">System Instructions:</label>
                  <textarea
                    rows={4}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 font-mono-custom text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 border border-[var(--rule)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-[var(--ink)] text-[var(--paper)] font-bold"
                  >
                    Save to Memory
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] font-mono-custom text-[12px] leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
                {mem.instructions}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)] m-0">
              4. Learned Winning Patterns
            </h4>
            <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] space-y-1.5 italic text-[13.5px]">
              {mem.keyLearnings.map((k, i) => (
                <div key={i} className="text-[var(--ink)]">
                  <span className="text-[var(--accent)] font-bold mr-1.5">★</span> {k}
                </div>
              ))}
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-2.5 bg-[var(--good)] text-[var(--paper)] font-mono-custom text-[11px] tracking-wider text-center font-bold">
            ✓ Memory updated and synchronized
          </div>
        )}
      </div>
    </div>
  );
};

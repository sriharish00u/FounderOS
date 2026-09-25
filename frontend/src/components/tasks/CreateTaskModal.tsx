import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { TaskPriority } from '../../types';

export const CreateTaskModal: React.FC = () => {
  const { 
    isCreateTaskModalOpen, 
    setIsCreateTaskModalOpen, 
    createTask, 
    humanEmployees, 
    aiEmployees, 
    departments, 
    goals, 
    auth 
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(aiEmployees[0]?.id || humanEmployees[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [department, setDepartment] = useState(departments[0]?.name || 'Engineering');
  const [deadline, setDeadline] = useState('2026-09-30');
  const [goalId, setGoalId] = useState(goals[0]?.id || '');

  if (!isCreateTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let assigneeName = '';
    let assigneeType: 'human' | 'ai' = 'human';
    let assigneeAvatar = '';
    let assigneeRole = '';

    const foundAI = aiEmployees.find(a => a.id === assigneeId);
    if (foundAI) {
      assigneeName = foundAI.name;
      assigneeType = 'ai';
      assigneeAvatar = foundAI.avatar;
      assigneeRole = foundAI.role;
    } else {
      const foundHuman = humanEmployees.find(h => h.id === assigneeId);
      if (foundHuman) {
        assigneeName = foundHuman.name;
        assigneeType = 'human';
        assigneeAvatar = foundHuman.avatar;
        assigneeRole = foundHuman.role;
      }
    }

    const selectedGoal = goals.find(g => g.id === goalId);

    const creator = auth.phase === 'authenticated' ? auth.user : null;
    const creatorName = creator
      ? creator.role === 'founder' || creator.role === 'co_founder'
        ? `${creator.name} (Founder)`
        : creator.name
      : 'Manager';

    createTask({
      title,
      description,
      creatorId: creator?.id ?? 'user-founder',
      creatorName,
      assigneeId: assigneeId || 'unassigned',
      assigneeName: assigneeName || 'Assigned Staff',
      assigneeType,
      assigneeAvatar,
      assigneeRole: assigneeRole || 'Team Member',
      department,
      priority,
      status: 'NOT_STARTED',
      deadline,
      goalId: selectedGoal?.id,
      goalTitle: selectedGoal?.title
    });

    setIsCreateTaskModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-xl shadow-2xl overflow-hidden text-[var(--ink)]">
        <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
          <div>
            <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-widest">
              Delegation &amp; Assignment
            </div>
            <h3 className="font-serif-display italic font-bold text-[24px] text-[var(--ink)] m-0">
              Create New Task
            </h3>
          </div>
          <button
            onClick={() => setIsCreateTaskModalOpen(false)}
            className="font-mono-custom text-[12px] font-bold border border-[var(--ink)] px-2 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            [ Close ]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-serif-body text-[13.5px]">
          <div>
            <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Design & Code Interactive Landing Page Hero"
              className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Requirements &amp; Deliverables</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Specify acceptance criteria, constraints, and target outcome..."
              className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Assignee *</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
              >
                <optgroup label="🤖 AI Workforce">
                  {aiEmployees.map(ai => (
                    <option key={ai.id} value={ai.id}>
                      🤖 {ai.name} ({ai.model})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="👤 Human Employees">
                  {humanEmployees.map(h => (
                    <option key={h.id} value={h.id}>
                      👤 {h.name} ({h.role})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
              >
                <option value="URGENT">🔴 Urgent</option>
                <option value="HIGH">🟡 High</option>
                <option value="MEDIUM">🔵 Medium</option>
                <option value="LOW">⚪ Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Linked Goal</label>
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[11px] focus:outline-none"
              >
                <option value="">None</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>🎯 {g.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--rule)] font-mono-custom text-[11px]">
            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(false)}
              className="px-4 py-1.5 border border-[var(--rule)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-bold shadow-sm"
            >
              Assign Task &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

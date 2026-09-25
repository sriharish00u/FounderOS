import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/useApp';
import { api } from '../../services/api';
import { AutocompleteCreate } from '../common/AutocompleteCreate';

const SAMPLE_DIRECTIVES = `Operating Directives for this AI specialist:

1. PRIMARY MISSION
   [State the one outcome this AI drives. Be specific.]
   Example: "Own the weekly customer churn analysis and reply to every high-risk ticket within 4 hours."

2. SUCCESS METRIC (KR - Proving it)
   [1 measurable number that proves value delivered.]
   Example: "Reduce churn by 15% by end of quarter; maintain a 95% on-time delivery rate."

3. QUALITY BAR
   [The standard every output must meet.]
   Example: "Every deliverable is data-backed, cites its source, and includes a caveats section."

4. DAILY RHYTHM
   [When and how it works.]
   Example: "Run nightly at 02:00 IST, summarize findings by 09:00, flag blockers to the founder."

5. ESCALATION RULES
   [When it pulls a human in.]
   Example: "Escalate if confidence < 70% or if a decision could cost more than ₹10,000."`;

interface CreateRolePopupProps {
  initialName: string;
  departments: string[];
  onClose: () => void;
  onCreate: (role: {
    name: string;
    description?: string;
    department?: string;
    priority?: string;
    responsibilities?: string[];
    permissions?: string[];
  }) => void;
}

const CreateRolePopup: React.FC<CreateRolePopupProps> = ({
  initialName,
  departments,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState(initialName);
  const [department, setDepartment] = useState(departments[0] || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [responsibilities, setResponsibilities] = useState('');
  const [permissions, setPermissions] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      description,
      department,
      priority,
      responsibilities: responsibilities.split(',').map(s => s.trim()).filter(Boolean),
      permissions: permissions.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-lg shadow-2xl overflow-hidden text-[var(--ink)]">
        <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
          <div>
            <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-widest">
              Organization Structure
            </div>
            <h4 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
              Create Role
            </h4>
          </div>
          <button
            onClick={onClose}
            className="font-mono-custom text-[12px] font-bold border border-[var(--ink)] px-2.5 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            [ Close ]
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 font-serif-body text-[13.5px]">
          <div>
            <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Role Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What this role is accountable for"
              className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
              Responsibilities <span className="text-[var(--muted)]/60">(comma separated)</span>
            </label>
            <input
              type="text"
              value={responsibilities}
              onChange={e => setResponsibilities(e.target.value)}
              placeholder="Own X, Review Y, Report Z"
              className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
              Permissions <span className="text-[var(--muted)]/60">(comma separated)</span>
            </label>
            <input
              type="text"
              value={permissions}
              onChange={e => setPermissions(e.target.value)}
              placeholder="read_tasks, submit_deliverables"
              className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--rule)] font-mono-custom text-[11px]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-[var(--rule)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[var(--ink)] text-[var(--paper)] font-bold"
            >
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const HireAIModal: React.FC = () => {
  const {
    auth,
    isHireModalOpen,
    setIsHireModalOpen,
    hireModalTab,
    setHireModalTab,
    hireAIEmployee,
    hireHumanEmployee,
    createDepartment,
    createRole,
    departments,
    roles
  } = useApp();

  const deptOptions = departments.map(d => d.name);
  const roleOptions = roles.map(r => r.name);
  const managerName = auth.phase === 'authenticated' ? auth.user.name : 'Founder';

  const [humanName, setHumanName] = useState('');
  const [humanEmail, setHumanEmail] = useState('');
  const [humanPhone, setHumanPhone] = useState('');
  const [humanRole, setHumanRole] = useState('');
  const [humanDept, setHumanDept] = useState('');
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [pendingRoleName, setPendingRoleName] = useState('');

  const [taskDescription, setTaskDescription] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [fallbackModels, setFallbackModels] = useState<string[]>([]);
  const [pendingFallback, setPendingFallback] = useState('');
  const [provider, setProvider] = useState<string | undefined>(undefined);
  const [modelError, setModelError] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isHireModalOpen) {
      setShowRolePopup(false);
      return;
    }
    setHumanName('');
    setHumanEmail('');
    setHumanPhone('');
    setHumanRole(roleOptions[0] || '');
    setHumanDept(deptOptions[0] || '');
    setTaskDescription('');
    setApiUrl('');
    setApiKey('');
    setModels([]);
    setModel('');
    setFallbackModels([]);
    setPendingFallback('');
    setProvider(undefined);
    setModelError('');
    setCopied(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHireModalOpen]);

  if (!isHireModalOpen) return null;

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_DIRECTIVES);
      setTaskDescription(SAMPLE_DIRECTIVES);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setTaskDescription(SAMPLE_DIRECTIVES);
    }
  };

  const loadModels = async () => {
    if (!apiUrl.trim() || !apiKey.trim()) return;
    setLoadingModels(true);
    setModelError('');
    try {
      const res = await api.loadAIModels(apiUrl.trim(), apiKey.trim());
      setModels(res.models);
      setProvider(res.provider);
      setModel(res.models[0] || '');
      setFallbackModels([]);
    } catch (err) {
      setModelError(err instanceof Error ? err.message : 'Could not load models');
      setModels([]);
      setModel('');
    } finally {
      setLoadingModels(false);
    }
  };

  const addFallback = (m: string) => {
    const id = m.trim();
    if (!id || fallbackModels.includes(id) || id === model.trim()) return;
    setFallbackModels(prev => [...prev, id]);
    setPendingFallback('');
  };

  const removeFallback = (id: string) => {
    setFallbackModels(prev => prev.filter(f => f !== id));
  };

  const handleDeployAI = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = taskDescription.trim();
    if (!desc || !model.trim()) return;

    const words = desc.split(/\s+/).slice(0, 4).join(' ');
    const derivedName = `AI · ${words.length > 40 ? words.slice(0, 40) + '…' : words}`;
    const targetDept = humanDept || deptOptions[0] || 'General';

    hireAIEmployee({
      name: derivedName,
      role: 'AI Agent',
      department: targetDept,
      managerName,
      provider: provider || '',
      model: model.trim(),
      apiEndpoint: apiUrl.trim(),
      apiKey: apiKey.trim(),
      fallbackModels: fallbackModels.length ? fallbackModels : undefined,
      instructions: desc,
      priority: 'HIGH'
    });

    setIsHireModalOpen(false);
  };

  const handleHireHuman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanEmail.trim() || !humanPhone.trim()) return;

    hireHumanEmployee({
      name: humanName.trim() || humanEmail.split('@')[0],
      email: humanEmail,
      phone: humanPhone,
      role: humanRole.trim() || 'Engineer',
      department: humanDept.trim() || 'Engineering'
    });

    setIsHireModalOpen(false);
  };

  const handleCreateRole = (role: {
    name: string;
    description?: string;
    department?: string;
    priority?: string;
    responsibilities?: string[];
    permissions?: string[];
  }) => {
    void createRole(role).then(() => {
      setHumanRole(role.name);
      setShowRolePopup(false);
    });
  };

  const handleCreateDept = async (name: string) => {
    await createDepartment({ name });
    setHumanDept(name);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-[var(--ink)]">
          <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
            <div>
              <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-widest">
                Workforce Provisioning
              </div>
              <h3 className="font-serif-display italic font-bold text-[24px] text-[var(--ink)] m-0">
                Hire Team Member
              </h3>
            </div>

            <button
              onClick={() => setIsHireModalOpen(false)}
              className="font-mono-custom text-[12px] font-bold border border-[var(--ink)] px-2.5 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              [ Close ]
            </button>
          </div>

          <div className="p-3 border-b border-[var(--rule)] bg-[var(--paper)]">
            <div className="flex gap-2 font-mono-custom text-[11px]">
              <button
                onClick={() => setHireModalTab('human')}
                className={`flex-1 py-1.5 font-semibold border ${
                  hireModalTab === 'human'
                    ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                    : 'border-[var(--rule)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                👤 Human Employee (Hire)
              </button>
              <button
                onClick={() => setHireModalTab('ai')}
                className={`flex-1 py-1.5 font-semibold border ${
                  hireModalTab === 'ai'
                    ? 'bg-[var(--accent)] text-[var(--paper)] border-[var(--accent)]'
                    : 'border-[var(--rule)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                🤖 AI Employee (Deploy Engine)
              </button>
            </div>
          </div>

          {hireModalTab === 'ai' ? (
            <form onSubmit={handleDeployAI} className="p-6 space-y-4 font-serif-body text-[13.5px] max-h-[70vh] overflow-y-auto">
              <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] font-mono-custom text-[11px] text-[var(--muted)]">
                ⚡ <strong>Connect any OpenAI-compatible LLM:</strong> paste base URL &amp; API key, load models, pick
                primary + fallback. Name, role &amp; department are derived from your description automatically.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)]">
                    Task Description &amp; Operating Directives *
                  </label>
                  <button
                    type="button"
                    onClick={() => void copyTemplate()}
                    className="font-mono-custom text-[10px] font-bold border border-[var(--rule)] px-2 py-0.5 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                  >
                    {copied ? '✓ Copied to clipboard' : '📋 Copy sample template'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={taskDescription}
                  onChange={e => setTaskDescription(e.target.value)}
                  placeholder="Define the mission, success metric, quality bar, rhythm and escalation rules..."
                  className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                    LLM API Base URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={apiUrl}
                    onChange={e => setApiUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => void loadModels()}
                  disabled={loadingModels || !apiUrl.trim() || !apiKey.trim()}
                  className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[11px] font-bold disabled:opacity-40"
                >
                  {loadingModels ? 'Loading…' : '↻ Load Models'}
                </button>
                <span className="font-mono-custom text-[10px] text-[var(--muted)]">
                  Pulls /models from your endpoint. Never logged.
                </span>
              </div>

              {modelError && (
                <div className="p-2 border border-[var(--ink)] bg-[var(--panel)] font-mono-custom text-[11px] text-[var(--ink)]">
                  ⚠ {modelError}
                </div>
              )}

              {loadingModels && (
                <div className="border border-dashed border-[var(--rule)] bg-[var(--panel)] px-3 py-3 flex items-center gap-2 overflow-hidden">
                  <div className="flex items-center">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="h-3 w-3 animate-spin text-[var(--accent)] shrink-0"
                        style={{ animationDelay: `${i * 0.12}s`, animationDuration: '0.9s' }}
                      >
                        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.5" />
                        <path d="M4.93 4.93a10 10 0 0 1 3.1-2.13" />
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" opacity="0.35" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-mono-custom text-[10px] text-[var(--muted)] whitespace-nowrap">
                    QUERYING /models · scanning model catalog…
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                    Primary Model *
                  </label>
                  {models.length > 0 ? (
                    <select
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                    >
                      {models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      placeholder={loadingModels ? 'Loading…' : 'Type model id (e.g. gpt-4o)'}
                      className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                    Fallback Models <span className="text-[var(--muted)]/60">(optional · unlimited)</span>
                  </label>
                  {fallbackModels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {fallbackModels.map((f, i) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--panel)] px-2 py-1 font-mono-custom text-[11px]"
                        >
                          <span className="text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
                          {f}
                          <button
                            type="button"
                            onClick={() => removeFallback(f)}
                            className="text-[var(--muted)] hover:text-[var(--ink)]"
                            title={`Remove ${f}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {models.length > 0 ? (
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) addFallback(e.target.value);
                      }}
                      className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                    >
                      <option value="">＋ Add fallback model…</option>
                      {models
                        .filter(m => !fallbackModels.includes(m) && m !== model)
                        .map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pendingFallback}
                        onChange={e => setPendingFallback(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFallback(pendingFallback);
                          }
                        }}
                        placeholder="Type a fallback model id"
                        className="flex-1 bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addFallback(pendingFallback)}
                        className="px-3 py-1.5 border border-[var(--ink)] font-mono-custom text-[11px] hover:bg-[var(--panel)]"
                      >
                        ＋ Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--rule)] font-mono-custom text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsHireModalOpen(false)}
                  className="px-4 py-1.5 border border-[var(--rule)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!model.trim()}
                  className="px-5 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-bold shadow-sm disabled:opacity-40"
                >
                  Deploy AI Worker
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleHireHuman} className="p-6 space-y-4 font-serif-body text-[13.5px]">
              <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] font-mono-custom text-[11px] text-[var(--muted)]">
                👤 <strong>Hiring Flow:</strong> The employee signs in with their email as username and their phone
                number as the password. Role &amp; Department are searchable — create one inline if it doesn't exist yet.
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Full Name</label>
                <input
                  type="text"
                  value={humanName}
                  onChange={e => setHumanName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={humanEmail}
                    onChange={e => setHumanEmail(e.target.value)}
                    placeholder="employee@founderos.io"
                    className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={humanPhone}
                    onChange={e => setHumanPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Role</label>
                  <AutocompleteCreate
                    value={humanRole}
                    onChange={setHumanRole}
                    options={roleOptions}
                    placeholder="Type to search roles…"
                    createLabel="Create role"
                    onCreate={name => {
                      setPendingRoleName(name);
                      setShowRolePopup(true);
                    }}
                  />
                </div>

                <div>
                  <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Department</label>
                  <AutocompleteCreate
                    value={humanDept}
                    onChange={setHumanDept}
                    options={deptOptions}
                    placeholder="Type to search departments…"
                    createLabel="Create department"
                    onCreate={name => void handleCreateDept(name)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--rule)] font-mono-custom text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsHireModalOpen(false)}
                  className="px-4 py-1.5 border border-[var(--rule)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[var(--ink)] text-[var(--paper)] font-bold"
                >
                  Hire Employee
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showRolePopup && (
        <CreateRolePopup
          initialName={pendingRoleName}
          departments={deptOptions}
          onClose={() => setShowRolePopup(false)}
          onCreate={handleCreateRole}
        />
      )}
    </>
  );
};
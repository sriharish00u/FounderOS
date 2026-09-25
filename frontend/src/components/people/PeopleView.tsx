import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { HumanEmployee } from '../../types';
import { EmployeeProfileModal } from './EmployeeProfileModal';

export const PeopleView: React.FC = () => {
  const { 
    humanEmployees, 
    aiEmployees,
    roles, 
    departments, 
    company, 
    setIsHireModalOpen, 
    setHireModalTab,
    setSelectedAIEmployee,
    setIsMemoryModalOpen,
    setIsCreateTaskModalOpen,
    updateEmployee,
    auth
  } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'ai' | 'roles' | 'departments'>('employees');
  const [profileEmployee, setProfileEmployee] = useState<HumanEmployee | null>(null);

  const isEmployee = auth.phase === 'authenticated' && auth.user.role === 'employee';
  const scopeDept = isEmployee ? auth.user.department : undefined;

  const visibleHumans = scopeDept ? humanEmployees.filter(h => h.department === scopeDept) : humanEmployees;
  const visibleAI = scopeDept ? aiEmployees.filter(a => a.department === scopeDept) : aiEmployees;
  const visibleRoles = scopeDept ? roles.filter(r => r.department === scopeDept) : roles;
  const visibleDepts = scopeDept ? departments.filter(d => d.name === scopeDept) : departments;

  const activeAiCount = visibleAI.filter(a => a.status === 'running').length;

  const headerButton = !isEmployee && activeTab === 'employees' ? (
    <button
      onClick={() => {
        setHireModalTab('human');
        setIsHireModalOpen(true);
      }}
      className="px-4 py-1.5 font-mono-custom text-[11px] tracking-wider bg-[var(--ink)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
    >
      + Hire Employee
    </button>
  ) : !isEmployee && activeTab === 'ai' ? (
    <button
      onClick={() => {
        setHireModalTab('ai');
        setIsHireModalOpen(true);
      }}
      className="px-4 py-1.5 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
    >
      + Hire AI Employee
    </button>
  ) : null;

  return (
    <div className="p-[30px_36px_44px] max-w-6xl">
      <div className="flex justify-between items-baseline border-b border-[var(--ink)] pb-4 mb-6">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            People, AI Agents, Roles &amp; Organizational Chart
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Human talent roster, deployed AI agents, custom role permissions, and departmental leads.
          </p>
        </div>

        {headerButton}
      </div>

      <div className="flex gap-2 border-b border-[var(--rule)] pb-3 mb-6 font-mono-custom text-[11px]">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3 py-1 ${
            activeTab === 'employees' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Employees ({visibleHumans.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('ai');
          }}
          className={`px-3 py-1 ${
            activeTab === 'ai' ? 'bg-[var(--accent)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          AI Agents ({visibleAI.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-3 py-1 ${
            activeTab === 'roles' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Roles ({visibleRoles.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3 py-1 ${
            activeTab === 'departments' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Departments ({visibleDepts.length})
        </button>
      </div>

      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isEmployee && (
          <div className="border-2 border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono-custom text-[10px] text-[var(--accent)] font-bold tracking-wider block">
                  Founder &amp; Owner
                </span>
                <h3 className="font-serif-body font-bold text-[18px] text-[var(--ink)] m-0 mt-0.5">
                  {company.owner.name}
                </h3>
                <span className="font-mono-custom text-[11px] text-[var(--muted)]">{company.code}-Owner</span>
              </div>
              <div className="w-[30px] h-[30px] rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-mono-custom font-bold text-[12px]">
                SH
              </div>
            </div>

            <div className="p-2.5 bg-[var(--paper)] border border-[var(--rule)] font-mono-custom text-[11px] space-y-1 text-[var(--muted)]">
              <div>Email: <span className="text-[var(--ink)]">{company.owner.email}</span></div>
              <div>Phone: <span className="text-[var(--ink)]">{company.owner.phone}</span></div>
            </div>
          </div>
          )}

          {visibleHumans.map(emp => (
            <div
              key={emp.id}
              role="button"
              onClick={() => setProfileEmployee(emp)}
              className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3 shadow-xs cursor-pointer transition hover:shadow-md group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono-custom text-[10px] text-[var(--muted)] font-semibold tracking-wider block">
                    {emp.department}
                  </span>
                  <h3 className="font-serif-body font-bold text-[17px] text-[var(--ink)] m-0 group-hover:underline">
                    {emp.name}
                  </h3>
                  <div className="font-serif-body italic text-[13px] text-[var(--muted)]">{emp.role}</div>
                  <span className="font-mono-custom text-[10px] text-[var(--muted)]">{emp.employeeCode}</span>
                </div>

                <span className="font-mono-custom text-[10px] border border-[var(--good)] text-[var(--good)] px-1.5 py-0.5 font-bold">
                  {emp.status}
                </span>
              </div>

              <div className="p-2.5 bg-[var(--paper)] border border-[var(--rule)] font-mono-custom text-[11px] space-y-1 text-[var(--muted)]">
                <div className="flex justify-between">
                  <span>Joined:</span>
                  <span className="text-[var(--ink)]">{emp.joinedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks Completed:</span>
                  <span className="text-[var(--good)] font-bold">{emp.tasksCompleted}</span>
                </div>
              </div>

              <div className="font-mono-custom text-[10px] text-[var(--muted)] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
                Click to view profile &amp; credentials →
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
              <div className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)]">Deployed AI Agents</div>
              <div className="font-serif-display font-bold text-[32px] text-[var(--ink)] mt-1">{visibleAI.length} Active</div>
              <div className="font-mono-custom text-[10px] text-[var(--good)] mt-1">● {activeAiCount} Running In Sprints</div>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
              <div className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)]">Completed Deliverables</div>
              <div className="font-serif-display font-bold text-[32px] text-[var(--accent)] mt-1">
                {visibleAI.reduce((acc, curr) => acc + curr.tasksCompleted, 0)} Shipped
              </div>
              <div className="font-serif-body italic text-[12px] text-[var(--muted)] mt-1">Across active AI agents</div>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
              <div className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)]">Engines</div>
              <div className="font-serif-display font-bold text-[32px] text-[var(--ink)] mt-1">Multi-Model</div>
              <div className="font-mono-custom text-[10px] text-[var(--muted)] mt-1">Anthropic · OpenAI · Google · Groq</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleAI.map(ai => (
              <div
                key={ai.id}
                className="border border-[var(--ink)] bg-[var(--panel)] p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono-custom text-[10px] text-[var(--muted)] font-semibold tracking-wider block">
                        {ai.department} · AI Agent
                      </span>
                      <h3 className="font-serif-body font-bold text-[16px] text-[var(--ink)] m-0">
                        {ai.name}
                      </h3>
                      <div className="font-serif-body italic text-[13px] text-[var(--muted)]">{ai.role}</div>
                      <span className="font-mono-custom text-[10px] text-[var(--muted)]">
                        Reports To: {ai.managerName}
                      </span>
                    </div>

                    <span className={`font-mono-custom text-[10px] font-bold px-1.5 py-0.5 border ${
                      ai.status === 'running' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--good)] text-[var(--good)]'
                    }`}>
                      {ai.status === 'running' ? '● Running' : 'Idle'}
                    </span>
                  </div>

                  <div className="p-3 bg-[var(--paper)] border border-[var(--rule)] font-mono-custom text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Engine:</span>
                      <span className="text-[var(--ink)] font-semibold">
                        {ai.provider} ({ai.model})
                        {(() => {
                          const fallbacks = ai.fallbackModels?.length ? ai.fallbackModels : (ai.fallbackModel ? [ai.fallbackModel] : []);
                          if (!fallbacks.length) return null;
                          return (
                            <span className="text-[var(--muted)]">
                              {' '}
                              · fallback:{' '}
                              {fallbacks.map((f, i) => (
                                <span key={f}>{i > 0 ? ', ' : ''}{f}</span>
                              ))}
                            </span>
                          );
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Memory Tokens:</span>
                      <span className="text-[var(--accent)] font-semibold">{ai.memory.tokenCount} T</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Tasks Completed:</span>
                      <span className="text-[var(--good)] font-semibold">{ai.tasksCompleted}</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono-custom text-[10px] text-[var(--muted)] mb-1">Directives:</div>
                    <ul className="list-none p-0 m-0 font-serif-body italic text-[12.5px] text-[var(--ink)] space-y-1">
                      {ai.memory.responsibilities.slice(0, 2).map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span>·</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--rule)] flex gap-2 font-mono-custom text-[11px]">
                  <button
                    onClick={() => {
                      setSelectedAIEmployee(ai);
                      setIsMemoryModalOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-[var(--paper)] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] font-semibold transition"
                  >
                    Inspect Memory
                  </button>

                  {!isEmployee && (
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="px-3 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-semibold hover:opacity-90 transition"
                  >
                    + Task
                  </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleRoles.map(role => (
            <div key={role.id} className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-serif-body font-bold text-[16px] text-[var(--ink)] m-0">{role.name}</h3>
                <span className="font-mono-custom text-[10px] text-[var(--muted)]">({role.memberCount} staff)</span>
              </div>
              <p className="font-serif-body italic text-[13px] text-[var(--muted)] m-0 leading-snug">{role.description}</p>
              <div className="pt-2 border-t border-[var(--rule)]">
                <div className="font-mono-custom text-[10px] text-[var(--muted)] mb-1">Responsibilities:</div>
                <ul className="list-none p-0 m-0 font-serif-body text-[12.5px] space-y-1">
                  {role.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span>·</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleDepts.map(dept => (
            <div key={dept.id} className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-serif-body font-bold text-[18px] text-[var(--ink)] m-0">{dept.name}</h3>
                <span className="font-mono-custom text-[14px] font-bold text-[var(--good)]">{dept.progress}% OKR</span>
              </div>
              <div className="font-serif-body italic text-[13px] text-[var(--muted)]">Lead: {dept.lead}</div>
              <div className="w-full bg-[var(--paper)] h-2 border border-[var(--ink)]">
                <div className="bg-[var(--ink)] h-full" style={{ width: `${dept.progress}%` }} />
              </div>
              <div className="flex justify-between font-mono-custom text-[10px] text-[var(--muted)] pt-1">
                <span>{dept.memberCount} human staff</span>
                <span className="text-[var(--accent)] font-semibold">{dept.aiCount} AI agents</span>
              </div>
            </div>
          ))}
        </div>
      )}
    {profileEmployee && (() => {
        const live = humanEmployees.find(e => e.id === profileEmployee.id) ?? profileEmployee;
        return (
          <EmployeeProfileModal
            employee={live}
            roleOptions={roles.map(r => r.name)}
            deptOptions={departments.map(d => d.name)}
            onClose={() => setProfileEmployee(null)}
            onSave={updateEmployee}
          />
        );
      })()}
    </div>
  );
};
import React from 'react';
import { useApp } from '../../context/useApp';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { 
    activeView, 
    setActiveView, 
    tasks, 
    humanEmployees,
    goals,
    company,
    auth,
    logout
  } = useApp();

  const user = auth.phase === 'authenticated' ? auth.user : null;
  const isEmployee = user?.role === 'employee';
  const scopeDept = isEmployee ? user?.department : undefined;

  const scopedTasks = scopeDept ? tasks.filter(t => t.department === scopeDept) : tasks;
  const scopedGoals = scopeDept ? goals.filter(g => g.department === scopeDept) : goals;
  const scopedStaff = scopeDept ? humanEmployees.filter(h => h.department === scopeDept) : humanEmployees;

  const pendingReviewsCount = scopedTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'REVIEW').length;
  const myTodoCount = user ? tasks.filter(t => t.assigneeName?.toLowerCase() === user.name.toLowerCase() && t.status !== 'COMPLETED').length : 0;
  const avgGoalProgress = scopedGoals.length ? Math.round(scopedGoals.reduce((sum, g) => sum + g.progressPercent, 0) / scopedGoals.length) : 0;

  const handleSelectView = (view: any) => {
    setActiveView(view);
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[260px] md:w-[232px] md:static shrink-0 border-r border-[var(--ink)] bg-[var(--paper)] p-[22px_22px_22px_28px] flex flex-col justify-between min-h-[calc(100vh-44px)] select-none transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-[22px]">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-serif-display italic font-extrabold text-[30px] leading-none tracking-[-0.005em] text-[var(--ink)]">
                Founder Os<span className="text-[var(--accent)]">.</span>
              </div>
              <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-[0.06em] mt-1 truncate max-w-[170px]">
                {company.name}
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-[var(--muted)] hover:text-[var(--ink)]"
              type="button"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--rule)]">
            <div className="w-[30px] h-[30px] rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-mono-custom font-bold text-[12px] tracking-[0.06em]">
              FO
            </div>
            <div className="font-mono-custom text-[13px] leading-tight">
              <b className="block text-[var(--ink)] font-medium">{user ? `@${user.name.split(' ')[0].toLowerCase()}` : '@founder'}</b>
              <span className="text-[var(--muted)] text-[11px] tracking-[0.06em]">TIER III · {company.code}</span>
            </div>
          </div>

          <div>
            <h4 className="font-mono-custom text-[11px] text-[var(--muted)] tracking-[0.18em] m-0 mb-2.5">
              Today
            </h4>
            <ul className="list-none p-0 m-0 mb-3.5 flex flex-col gap-1">
              <li
                onClick={() => handleSelectView('dashboard')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'dashboard' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'dashboard' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  Command Center
                </span>
                <span className="font-mono-custom text-[10px] text-[var(--muted)]">{scopedTasks.length}</span>
              </li>

              <li
                onClick={() => handleSelectView('tasks')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'tasks' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'tasks' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  Tasks &amp; Pipeline
                </span>
                {pendingReviewsCount > 0 ? (
                  <span className="bg-[var(--accent)] text-[var(--paper)] font-mono-custom text-[10px] px-1.5 py-0.5 rounded-full">
                    {pendingReviewsCount} rev
                  </span>
                ) : (
                  <span className="font-mono-custom text-[11px] text-[var(--muted)]">{scopedTasks.length}</span>
                )}
              </li>

              <li
                onClick={() => handleSelectView('todos')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'todos' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'todos' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  My Todos
                </span>
                <span className="bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[10px] px-1.5 py-0.5 rounded-full">
                  {myTodoCount}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono-custom text-[11px] text-[var(--muted)] tracking-[0.18em] m-0 mb-2.5">
              Organization
            </h4>
            <ul className="list-none p-0 m-0 mb-3.5 flex flex-col gap-1">
              <li
                onClick={() => handleSelectView('people')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'people' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'people' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  People &amp; Roles
                </span>
                <span className="font-mono-custom text-[11px] text-[var(--muted)]">{isEmployee ? `${scopedStaff.length} teammate${scopedStaff.length === 1 ? '' : 's'}` : `${humanEmployees.length} staff`}</span>
              </li>

              <li
                onClick={() => handleSelectView('goals')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'goals' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'goals' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  Strategic OKRs
                </span>
                <span className="font-mono-custom text-[11px] text-[var(--good)]">{avgGoalProgress}%</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono-custom text-[11px] text-[var(--muted)] tracking-[0.18em] m-0 mb-2.5">
              Archive &amp; Audit
            </h4>
            <ul className="list-none p-0 m-0 mb-3.5 flex flex-col gap-1">
              <li
                onClick={() => handleSelectView('reports')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'reports' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'reports' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  Velocity Reports
                </span>
              </li>

              <li
                onClick={() => handleSelectView('settings')}
                className={`flex justify-between items-center px-2 py-1.5 rounded-sm font-serif-body text-[15.5px] leading-tight cursor-pointer transition ${
                  activeView === 'settings' 
                    ? 'bg-[rgba(193,74,43,0.10)] text-[var(--accent)] font-semibold' 
                    : 'text-[var(--ink)] hover:bg-[var(--panel)]'
                }`}
              >
                <span className="flex items-center">
                  {activeView === 'settings' && <span className="text-[var(--accent)] mr-1.5 text-[9px]">●</span>}
                  Settings &amp; Audit
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-[18px] border-t border-[var(--rule)] font-mono-custom text-[11px] leading-[1.4] text-[var(--muted)] tracking-[0.06em]">
          <button
            onClick={() => logout()}
            className="w-full text-left flex items-center gap-1.5 hover:text-[var(--bad)] transition"
          >
            <span className="text-[8px]">●</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

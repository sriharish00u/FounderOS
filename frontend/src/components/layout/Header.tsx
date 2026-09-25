import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

export const Header: React.FC = () => {
  const { 
    activities, 
    notifications, 
    markNotificationAsRead, 
    setIsHireModalOpen, 
    setHireModalTab,
    setIsCreateTaskModalOpen,
    company,
    auth
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHireDropdownOpen, setIsHireDropdownOpen] = useState(false);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const isEmployee = auth.phase === 'authenticated' && auth.user.role === 'employee';

  return (
    <header className="bg-[var(--paper)] text-[var(--ink)] sticky top-0 z-20 select-none">
      <div className="flex justify-between items-center px-7 py-3 border-b border-[var(--ink)] font-mono-custom text-[11px] text-[var(--muted)] tracking-[0.14em]">
        <div className="flex items-center gap-3">
          <span className="text-[var(--ink)] font-semibold">Founder Os</span>
          <span className="opacity-40">·</span>
          <span>{company.name}</span>
        </div>
        <div className="text-[var(--muted)]">
          <span className="text-[var(--ink)] font-medium">{company.code}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-7 py-2.5 border-b border-[var(--rule)] bg-[var(--panel)] text-[12px]">
        <div className="flex-1 overflow-hidden mr-6 relative">
          <div className="animate-marquee-slow flex items-center space-x-8 font-mono-custom text-[11px] text-[var(--muted)]">
            {activities.map((act) => (
              <span key={act.id} className="inline-flex items-center space-x-2 shrink-0">
                <span className="text-[var(--muted)]">[{act.timestamp}]</span>
                <span className="font-semibold text-[var(--ink)]">
                  {act.actorType === 'ai' ? '🤖' : act.actorType === 'founder' ? '👑' : '👤'} {act.actorName}
                </span>
                <span>{act.action}</span>
                <span className="text-[var(--accent)] font-serif-body italic">"{act.target}"</span>
                <span className="opacity-40">·</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="px-2.5 py-1 font-mono-custom text-[11px] tracking-wider border border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
            >
              Dispatch ({unreadNotifsCount})
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--panel)] border border-[var(--ink)] shadow-2xl p-3 z-50 text-[12px] font-serif-body">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--rule)] font-mono-custom text-[11px] tracking-wider">
                  <span>Communications</span>
                  <span className="text-[var(--accent)]">{unreadNotifsCount} unread</span>
                </div>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2 border-b border-[var(--rule)] cursor-pointer ${n.read ? 'opacity-50' : 'bg-[var(--paper)]'}`}
                    >
                      <div className="flex justify-between text-[11px] font-mono-custom">
                        <b className="text-[var(--ink)]">{n.title}</b>
                        <span className="text-[var(--muted)]">{n.timestamp}</span>
                      </div>
                      <p className="text-[12px] text-[var(--muted)] italic mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isEmployee && (
            <div className="relative">
              <button
                onClick={() => setIsHireDropdownOpen(!isHireDropdownOpen)}
                className="px-3 py-1 font-mono-custom text-[11px] tracking-wider border border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
              >
                + Hire
              </button>

              {isHireDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--panel)] border border-[var(--ink)] shadow-xl p-1 z-50 font-serif-body text-[13px]">
                  <button
                    onClick={() => {
                      setHireModalTab('human');
                      setIsHireModalOpen(true);
                      setIsHireDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--paper)] text-[var(--ink)] flex items-center justify-between"
                  >
                    <span>👤 Employee</span>
                    <span className="font-mono-custom text-[10px] text-[var(--muted)]">Hire</span>
                  </button>
                  <button
                    onClick={() => {
                      setHireModalTab('ai');
                      setIsHireModalOpen(true);
                      setIsHireDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--paper)] text-[var(--accent)] font-semibold flex items-center justify-between"
                  >
                    <span>🤖 Ai Employee</span>
                    <span className="font-mono-custom text-[10px] text-[var(--accent)]">Deploy</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!isEmployee && (
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="px-3.5 py-1 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
            >
              + Task
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

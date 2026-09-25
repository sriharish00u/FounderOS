import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { TaskStatus } from '../../types';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'NOT_STARTED', title: 'Not Started', color: 'text-[var(--muted)]' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-[var(--ink)]' },
  { id: 'SUBMITTED', title: 'Submitted', color: 'text-[var(--accent)]' },
  { id: 'REVIEW', title: 'Under Review', color: 'text-[var(--accent)]' },
  { id: 'COMPLETED', title: 'Completed', color: 'text-[var(--good)]' }
];

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    setSelectedTask, 
    setIsCreateTaskModalOpen,
    auth,
    departments
  } = useApp();

  const isEmployee = auth.phase === 'authenticated' && auth.user.role === 'employee';
  const scopeDept = isEmployee ? auth.user.department : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'human' | 'ai'>('all');
  const [filterDept, setFilterDept] = useState<string>('all');

  const baseTasks = scopeDept ? tasks.filter(t => t.department === scopeDept) : tasks;

  const filteredTasks = baseTasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && task.assigneeType !== filterType) {
      return false;
    }
    if (filterDept !== 'all' && task.department !== filterDept) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-[30px_36px_44px] max-w-7xl">
      <div className="flex justify-between items-baseline border-b border-[var(--ink)] pb-4 mb-6">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            Tasks &amp; Execution Pipeline
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            {isEmployee ? `Live ${scopeDept} execution board — every status your department is moving through.` : 'Not Started → In Progress → Submitted → Review → Completed'}
          </p>
        </div>

        {!isEmployee && (
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="px-4 py-1.5 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
          >
            + Create Task
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 p-3 border border-[var(--rule)] bg-[var(--panel)] mb-6 font-mono-custom text-[11px] flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search deliverables..."
          className="bg-[var(--paper)] border border-[var(--rule)] px-3 py-1 text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--ink)] w-60"
        />

        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">Worker:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 border ${filterType === 'all' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border-[var(--rule)] text-[var(--muted)]'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('human')}
            className={`px-2 py-0.5 border ${filterType === 'human' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border-[var(--rule)] text-[var(--muted)]'}`}
          >
            Human
          </button>
          <button
            onClick={() => setFilterType('ai')}
            className={`px-2 py-0.5 border ${filterType === 'ai' ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border-[var(--rule)] text-[var(--muted)]'}`}
          >
            AI Agent
          </button>
        </div>

        {!isEmployee && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">Department:</span>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="bg-[var(--paper)] border border-[var(--rule)] px-2 py-1 text-[var(--ink)] focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="border border-[var(--ink)] bg-[var(--panel)] p-3 min-h-[460px] flex flex-col">
              <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-[var(--rule)] font-mono-custom text-[11px] tracking-wider">
                <span className={`font-semibold ${col.color}`}>{col.title}</span>
                <span className="font-bold text-[var(--ink)]">({colTasks.length})</span>
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 font-serif-body italic text-[12px] text-[var(--muted)] border border-dashed border-[var(--rule)] p-2">
                    No Items on File
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--ink)] p-3 cursor-pointer transition space-y-2 shadow-xs group"
                    >
                      <div className="flex justify-between items-start font-mono-custom text-[10px] text-[var(--muted)]">
                        <span className={`font-bold ${task.priority === 'URGENT' ? 'text-[var(--bad)]' : task.priority === 'HIGH' ? 'text-[var(--accent)]' : ''}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                        </span>
                        <span>{task.department.split(' ')[0]}</span>
                      </div>

                      <h4 className="font-serif-body font-bold text-[14px] leading-snug text-[var(--ink)] group-hover:text-[var(--accent)] transition m-0">
                        {task.title}
                      </h4>

                      <p className="font-serif-body italic text-[12px] text-[var(--muted)] line-clamp-2 m-0 leading-tight">
                        {task.description}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-[var(--rule)] font-mono-custom text-[10px] text-[var(--muted)]">
                        <span className="text-[var(--ink)] font-medium">
                          {task.assigneeType === 'ai' ? '🤖' : '👤'} {task.assigneeName}
                        </span>
                        <span>{task.deadline.substring(5)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

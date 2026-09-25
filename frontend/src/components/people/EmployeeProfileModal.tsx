import React, { useState } from 'react';
import type { HumanEmployee } from '../../types';
import { normalizePhone } from '../../utils/phone';

interface EmployeeProfileModalProps {
  employee: HumanEmployee;
  roleOptions: string[];
  deptOptions: string[];
  onClose: () => void;
  onSave: (id: string, data: { name?: string; email?: string; phone?: string; role?: string; department?: string }) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  roleOptions,
  deptOptions,
  onClose,
  onSave
}) => {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    department: employee.department
  });

  const field = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return;
    onSave(employee.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role.trim() || 'Engineer',
      department: form.department.trim() || 'Engineering'
    });
    setEditing(false);
  };

  const labelClass = 'block font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5';
  const inputClass =
    'w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-lg shadow-2xl my-8 text-[var(--ink)]">
        <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
          <div>
            <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-widest">Human Roster</div>
            <h3 className="font-serif-display italic font-bold text-[24px] text-[var(--ink)] m-0">
              {editing ? 'Edit Employee' : 'Employee Profile'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="font-mono-custom text-[12px] font-bold border border-[var(--ink)] px-2.5 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            [ Close ]
          </button>
        </div>

        {editing ? (
          <form onSubmit={submit} className="p-6 space-y-4 font-serif-body text-[13.5px]">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => field('name', e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email (login username)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => field('email', e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Phone (login password)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => field('phone', e.target.value)}
                className={inputClass}
                required
              />
              <p className="mt-1 font-mono-custom text-[10px] text-[var(--muted)]">
                Password becomes {normalizePhone(form.phone) || '—'} on save if the number changes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Role</label>
                <input
                  type="text"
                  list="profile-role-suggestions"
                  value={form.role}
                  onChange={e => field('role', e.target.value)}
                  className={inputClass}
                />
                <datalist id="profile-role-suggestions">
                  {roleOptions.map(r => <option key={r} value={r} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input
                  type="text"
                  list="profile-dept-suggestions"
                  value={form.department}
                  onChange={e => field('department', e.target.value)}
                  className={inputClass}
                />
                <datalist id="profile-dept-suggestions">
                  {deptOptions.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--rule)] font-mono-custom text-[11px]">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 border border-[var(--rule)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[var(--ink)] text-[var(--paper)] font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono-custom text-[10px] text-[var(--muted)] font-semibold tracking-wider block">
                  {employee.department}
                </span>
                <h4 className="font-serif-body font-bold text-[20px] text-[var(--ink)] m-0">{employee.name}</h4>
                <div className="font-serif-body italic text-[13.5px] text-[var(--muted)]">{employee.role}</div>
                <span className="font-mono-custom text-[10px] text-[var(--muted)]">{employee.employeeCode}</span>
              </div>
              <span className="font-mono-custom text-[10px] border border-[var(--good)] text-[var(--good)] px-1.5 py-0.5 font-bold">
                {employee.status}
              </span>
            </div>

            <div className="p-3 bg-[var(--panel)] border border-[var(--rule)] font-mono-custom text-[11px] space-y-1.5 text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-[var(--ink)]">{employee.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="text-[var(--ink)]">{employee.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Joined:</span>
                <span className="text-[var(--ink)]">{employee.joinedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks Completed:</span>
                <span className="text-[var(--good)] font-bold">{employee.tasksCompleted}</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--accent)] font-mono-custom text-[11px] space-y-1.5">
              <div className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-[var(--accent)] font-bold">
                ◆ Login Credentials
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Username (email):</span>
                <span className="text-[var(--ink)] font-semibold">{employee.email}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-[var(--muted)]">Password (phone):</span>
                <span className="text-[var(--ink)] font-semibold">
                  {showPassword ? normalizePhone(employee.phone) : normalizePhone(employee.phone).replace(/.(?=.{4})/g, '·')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="font-mono-custom text-[10px] border border-[var(--rule)] px-1.5 py-0.5 text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="m-0 pt-1 text-[10px] text-[var(--muted)] border-t border-[var(--rule)]">
                This employee signs in with the email above and this phone number as their password.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--rule)] font-mono-custom text-[11px]">
              <button
                onClick={() => {
                  setForm({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    role: employee.role,
                    department: employee.department
                  });
                  setEditing(true);
                }}
                className="px-4 py-1.5 border border-[var(--ink)] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
              >
                ✎ Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
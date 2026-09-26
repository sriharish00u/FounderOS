import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/useApp';
import { normalizePhone } from '../../utils/phone';

const STEPS = ['Personal Profile', 'Work & Role', 'Set Password', 'Preferences & Ready'];

export const OnboardingWizard: React.FC = () => {
  const { auth, completeOnboarding, departments, roles, humanEmployees } = useApp();

  const user = auth.phase === 'authenticated' ? auth.user : null;
  const employee = useMemo(
    () => humanEmployees.find(e => e.email.toLowerCase() === (user?.email ?? '').toLowerCase()),
    [humanEmployees, user]
  );

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(() => ({
    name: user?.name ?? employee?.name ?? '',
    phone: user?.phone ?? employee?.phone ?? '',
    department: user?.department ?? employee?.department ?? '',
    role: employee?.role || (user?.role && user?.role !== 'employee' ? user.role : '') || '',
    level: user?.level ?? employee?.level ?? '',
    managerName: user?.department ? '' : employee?.managerName ?? '',
    bio: user?.bio ?? employee?.bio ?? '',
    skills: (user?.skills ?? employee?.skills ?? []).join(', '),
    dob: user?.profile?.dob ?? '',
    gender: user?.profile?.gender ?? '',
    city: user?.profile?.city ?? '',
    altPhone: user?.profile?.altPhone ?? '',
    personalEmail: user?.profile?.personalEmail ?? '',
    address: user?.profile?.address ?? '',
    password: '',
    confirm: '',
    notifications: user?.preferences?.notifications ?? 'weekly',
    workMode: user?.preferences?.workMode ?? 'hybrid',
  }));

  React.useEffect(() => {
    if (employee) {
      setForm((f) => ({
        ...f,
        name: f.name || employee.name || '',
        phone: f.phone || employee.phone || '',
        department: f.department || employee.department || '',
        role: f.role || employee.role || '',
        level: f.level || employee.level || '',
        bio: f.bio || employee.bio || '',
      }));
    }
  }, [employee]);

  const field = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));

  const deptLead = departments.find(d => d.name === form.department)?.lead ?? '';

  const canContinue = () => {
    if (step === 0) {
      if (!form.name.trim()) return 'Your full name is required.';
      if (!form.dob) return 'Date of birth is required.';
      if (!form.city.trim()) return 'City is required.';
      if (!form.personalEmail.trim()) {
        return 'A personal email is required for profile recovery.';
      }
      return '';
    }
    if (step === 1) {
      if (!form.department.trim()) return 'Department is required — pick the team you belong to.';
      if (!form.role.trim()) return 'Role/designation is required.';
      return '';
    }
    if (step === 2) {
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password === normalizePhone(form.phone)) {
        return 'Password cannot be your phone number or the temporary login password.';
      }
      if (form.password !== form.confirm) return 'Passwords do not match.';
      return '';
    }
    return '';
  };

  const next = () => {
    const problem = canContinue();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError('');
    setStep(s => Math.max(s - 1, 0));
  };

  const submit = async () => {
    const problem = canContinue();
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await completeOnboarding({
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        role: form.role.trim(),
        level: form.level.trim() || undefined,
        managerName: form.managerName.trim() || deptLead || undefined,
        password: form.password,
        bio: form.bio.trim() || undefined,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        profile: {
          dob: form.dob,
          gender: form.gender.trim() || undefined,
          city: form.city.trim() || undefined,
          altPhone: form.altPhone.trim() || undefined,
          personalEmail: form.personalEmail.trim() || undefined,
          address: form.address.trim() || undefined,
        },
        preferences: {
          notifications: form.notifications,
          workMode: form.workMode,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong saving your profile.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const labelClass = 'block font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5';
  const inputClass =
    'w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none text-[var(--ink)]';

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center p-6 font-serif-body">
      <div className="w-full max-w-2xl border-2 border-[var(--ink)] bg-[var(--paper)] shadow-[8px_8px_0_0_var(--ink)]">
        <div className="p-6 border-b border-[var(--ink)] bg-[var(--panel)]">
          <div className="font-mono-custom text-[11px] text-[var(--accent)] tracking-[0.2em] font-bold">
            FOUNDER OS · EMPLOYEE ONBOARDING
          </div>
          <h2 className="font-serif-display italic font-extrabold text-[30px] m-0 mt-1">
            Welcome to the team, {form.name.split(' ')[0] || 'friend'}.
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Four short steps to set up your profile, secure your login, and join your department.
          </p>
        </div>

        <div className="flex border-b border-[var(--ink)] font-mono-custom text-[10px]">
          {STEPS.map((label, i) => (
            <div key={label} className={`flex-1 px-3 py-2.5 text-center tracking-wider ${
              i === step ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : i < step ? 'text-[var(--good)] font-bold' : 'text-[var(--muted)]'
            }`}>
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {step === 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name</label>
                  <input type="text" value={form.name} onChange={e => field('name', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input type="date" value={form.dob} onChange={e => field('dob', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <input
                    type="text" list="wizard-gender" value={form.gender}
                    onChange={e => field('gender', e.target.value)} className={inputClass}
                  />
                  <datalist id="wizard-gender">
                    <option value="Male" /><option value="Female" /><option value="Non-binary" /><option value="Prefer not to say" />
                  </datalist>
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" value={form.city} onChange={e => field('city', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Alternative Phone</label>
                  <input type="tel" value={form.altPhone} onChange={e => field('altPhone', e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Personal Email *</label>
                  <input type="email" value={form.personalEmail} onChange={e => field('personalEmail', e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Home Address</label>
                  <input type="text" value={form.address} onChange={e => field('address', e.target.value)} className={inputClass} />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Department *</label>
                <input
                  type="text" list="wizard-dept" value={form.department}
                  onChange={e => field('department', e.target.value)} className={inputClass}
                />
                <datalist id="wizard-dept">
                  {departments.map(d => <option key={d.id} value={d.name} />)}
                </datalist>
                <p className="font-mono-custom text-[10px] text-[var(--muted)] mt-1">
                  Lead: <b className="text-[var(--accent)]">{deptLead || '—'}</b>
                </p>
              </div>
              <div>
                <label className={labelClass}>Role / Designation *</label>
                <input
                  type="text" list="wizard-role" value={form.role}
                  onChange={e => field('role', e.target.value)} className={inputClass}
                />
                <datalist id="wizard-role">
                  {roles.map(r => <option key={r.id} value={r.name} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Level (e.g. SDE II, Senior)</label>
                <input type="text" value={form.level} onChange={e => field('level', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reports To (Manager)</label>
                <input
                  type="text" list="wizard-manager" value={form.managerName}
                  onChange={e => field('managerName', e.target.value)} className={inputClass}
                />
                <datalist id="wizard-manager">
                  {humanEmployees.filter(h => h.name !== form.name).map(h => <option key={h.id} value={h.name} />)}
                </datalist>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Skills (comma separated)</label>
                <input type="text" value={form.skills} onChange={e => field('skills', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Short Bio</label>
                <textarea rows={2} value={form.bio} onChange={e => field('bio', e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 border border-[var(--accent)] bg-[var(--panel)] font-mono-custom text-[11px] text-[var(--muted)] space-y-1">
                <div>Work email: <b className="text-[var(--ink)]">{user?.email}</b></div>
                <div>Your current login password is your temporary phone password.</div>
                <div>Set a real password below — at least 6 characters, and not your phone number.</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>New Password *</label>
                  <input type="password" value={form.password} onChange={e => field('password', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password *</label>
                  <input type="password" value={form.confirm} onChange={e => field('confirm', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Notification Preference</label>
                <div className="flex gap-2 font-mono-custom text-[11px]">
                  {(['daily', 'weekly', 'off'] as const).map(opt => (
                    <button
                      key={opt} type="button"
                      onClick={() => field('notifications', opt)}
                      className={`px-3 py-1 border ${
                        form.notifications === opt ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border-[var(--rule)] text-[var(--muted)]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Work Mode</label>
                <div className="flex gap-2 font-mono-custom text-[11px]">
                  {(['office', 'hybrid', 'async'] as const).map(opt => (
                    <button
                      key={opt} type="button"
                      onClick={() => field('workMode', opt)}
                      className={`px-3 py-1 border ${
                        form.workMode === opt ? 'bg-[var(--ink)] text-[var(--paper)] font-bold' : 'border-[var(--rule)] text-[var(--muted)]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-[var(--ink)] bg-[var(--panel)] p-4 font-mono-custom text-[11px] space-y-1.5 text-[var(--muted)]">
                <div className="text-[var(--accent)] font-bold tracking-widest text-[10px]">SUMMARY</div>
                <div>Name: <b className="text-[var(--ink)]">{form.name}</b></div>
                <div>Department: <b className="text-[var(--ink)]">{form.department}</b> · Role: <b className="text-[var(--ink)]">{form.role}</b></div>
                <div>Reports to: <b className="text-[var(--ink)]">{form.managerName || deptLead || '—'}</b></div>
                <div>City: <b className="text-[var(--ink)]">{form.city}</b> · Password: <b className="text-[var(--good)]">Set ✓</b></div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-[var(--rule)] font-mono-custom text-[11px]">
            <div>
              {step > 0 && (
                <button type="button" onClick={back} className="px-4 py-1.5 border border-[var(--rule)] text-[var(--muted)] hover:text-[var(--ink)]">
                  ← Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {error && <span className="text-[var(--bad)] font-bold text-[11px]">{error}</span>}
              {submitting && <span className="text-[var(--muted)]">Saving…</span>}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="px-5 py-1.5 bg-[var(--ink)] text-[var(--paper)] font-bold">
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="px-5 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-bold shadow-sm disabled:opacity-60"
                >
                  Start Working →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
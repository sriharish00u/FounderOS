import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

export const SettingsView: React.FC = () => {
  const { auth } = useApp();

  const isEmployee = auth.phase === 'authenticated' && auth.user.role === 'employee';

  return isEmployee ? <EmployeeProfileSettings /> : <CompanySettings />;
};

const CompanySettings: React.FC = () => {
  const { company, updateCompany } = useApp();

  const [companyName, setCompanyName] = useState(company.name);
  const [companyCode, setCompanyCode] = useState(company.code);
  const [companyType, setCompanyType] = useState(company.type);
  const [companyAddress, setCompanyAddress] = useState(company.address);
  const [isOnline, setIsOnline] = useState(company.isOnline);
  const [hasCoFounders, setHasCoFounders] = useState(company.coFounders.length > 0);
  const [coFounders, setCoFounders] = useState(company.coFounders);
  
  const [saved, setSaved] = useState(false);

  const handleAddCoFounder = () => {
    setCoFounders([
      ...coFounders,
      {
        id: `cf-${Date.now()}`,
        name: '',
        email: '',
        phone: ''
      }
    ]);
  };

  const handleRemoveCoFounder = (id: string) => {
    setCoFounders(coFounders.filter(cf => cf.id !== id));
  };

  const handleUpdateCoFounder = (id: string, field: 'name' | 'email' | 'phone', val: string) => {
    setCoFounders(coFounders.map(cf => cf.id === id ? { ...cf, [field]: val } : cf));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompany({
      name: companyName,
      code: companyCode,
      type: companyType,
      address: companyAddress,
      isOnline,
      coFounders: hasCoFounders ? coFounders : []
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-[30px_36px_44px] max-w-5xl text-[var(--ink)]">
      <div className="border-b border-[var(--ink)] pb-4 mb-6">
        <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
          Company Settings &amp; Organizational Governance
        </h2>
        <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
          Master registration parameters and co-founder permissions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 font-serif-body text-[14px]">
        <div className="border border-[var(--ink)] bg-[var(--panel)] p-6 space-y-4">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Company Registration Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Unique Company Code *</label>
              <input
                type="text"
                required
                value={companyCode}
                onChange={e => setCompanyCode(e.target.value)}
                className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] text-[var(--accent)] font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">Industry / Product Type</label>
              <input
                type="text"
                value={companyType}
                onChange={e => setCompanyType(e.target.value)}
                className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">HQ Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={e => setCompanyAddress(e.target.value)}
                className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 font-serif-body text-[14px] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-[var(--paper)] border border-[var(--rule)]">
            <div>
              <div className="font-bold text-[14px]">Online / Distributed Workforce Mode</div>
              <div className="font-serif-body italic text-[12px] text-[var(--muted)]">Enables real-time human and AI agent synchronization across remote hubs.</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1 font-mono-custom text-[11px] font-bold transition ${
                isOnline ? 'bg-[var(--good)] text-[var(--paper)]' : 'bg-[var(--muted)] text-[var(--paper)]'
              }`}
            >
              {isOnline ? '[ Online ]' : '[ Offline ]'}
            </button>
          </div>
        </div>

        <div className="border border-[var(--ink)] bg-[var(--panel)] p-6 space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
              Co-Founders Structure
            </h3>

            <button
              type="button"
              onClick={() => setHasCoFounders(!hasCoFounders)}
              className="font-mono-custom text-[11px] font-bold text-[var(--accent)]"
            >
              {hasCoFounders ? 'Co-Founders: [ On ]' : 'Co-Founders: [ Off ]'}
            </button>
          </div>

          {hasCoFounders && (
            <div className="space-y-3 pt-2">
              {coFounders.map((cf, idx) => (
                <div key={cf.id} className="p-3 bg-[var(--paper)] border border-[var(--rule)] space-y-2">
                  <div className="flex justify-between items-center font-mono-custom text-[11px]">
                    <span className="font-bold">Co-Founder #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoFounder(cf.id)}
                      className="text-[var(--bad)] font-bold hover:underline"
                    >
                      [ Remove ]
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Co-founder Name"
                      value={cf.name}
                      onChange={e => handleUpdateCoFounder(cf.id, 'name', e.target.value)}
                      className="bg-[var(--panel)] border border-[var(--rule)] p-1.5 font-serif-body text-[13px]"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={cf.email}
                      onChange={e => handleUpdateCoFounder(cf.id, 'email', e.target.value)}
                      className="bg-[var(--panel)] border border-[var(--rule)] p-1.5 font-serif-body text-[13px]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={cf.phone}
                      onChange={e => handleUpdateCoFounder(cf.id, 'phone', e.target.value)}
                      className="bg-[var(--panel)] border border-[var(--rule)] p-1.5 font-serif-body text-[13px]"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddCoFounder}
                className="font-mono-custom text-[11px] text-[var(--accent)] font-bold hover:underline"
              >
                + Add Co-Founder
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-3">
          {saved && (
            <span className="font-mono-custom text-[11px] text-[var(--good)] font-bold">
              ✓ Config saved
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[11px] font-bold hover:opacity-90 transition shadow-sm"
          >
            Save Configuration &rarr;
          </button>
        </div>
      </form>
    </div>
  );
};

const EmployeeProfileSettings: React.FC = () => {
  const { auth, completeOnboarding, departments, roles, humanEmployees } = useApp();

  const user = auth.phase === 'authenticated' ? auth.user : null;
  const employee = user ? humanEmployees.find(e => e.email.toLowerCase() === user.email.toLowerCase()) : null;

  const [form, setForm] = useState({
    name: user?.name ?? employee?.name ?? '',
    phone: user?.phone ?? employee?.phone ?? '',
    department: user?.department ?? employee?.department ?? '',
    role: employee?.role ?? (user?.role === 'employee' ? '' : user?.role ?? ''),
    level: user?.level ?? employee?.level ?? '',
    managerName: user?.department ? employee?.managerName ?? '' : employee?.managerName ?? '',
    bio: user?.bio ?? employee?.bio ?? '',
    skills: (user?.skills ?? employee?.skills ?? []).join(', '),
    dob: user?.profile?.dob ?? '',
    gender: user?.profile?.gender ?? '',
    city: user?.profile?.city ?? '',
    altPhone: user?.profile?.altPhone ?? '',
    personalEmail: user?.profile?.personalEmail ?? '',
    address: user?.profile?.address ?? '',
    notifications: user?.preferences?.notifications ?? employee?.preferences?.notifications ?? 'weekly',
    workMode: user?.preferences?.workMode ?? employee?.preferences?.workMode ?? 'hybrid',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const field = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await completeOnboarding({
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        role: form.role.trim() || undefined,
        level: form.level.trim() || undefined,
        managerName: form.managerName.trim() || undefined,
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const labelClass = 'block font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5';
  const inputClass =
    'w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none text-[var(--ink)]';

  return (
    <div className="p-[30px_36px_44px] max-w-5xl text-[var(--ink)]">
      <div className="border-b border-[var(--ink)] pb-4 mb-6">
        <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
          My Profile &amp; Work Settings
        </h2>
        <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
          Your personal record on file with your department. Updates sync to your profile instantly.
        </p>
      </div>

      <div className="p-4 border border-[var(--accent)] bg-[var(--panel)] font-mono-custom text-[11px] text-[var(--muted)] space-y-1 mb-6">
        <div>Login email: <b className="text-[var(--ink)]">{user?.email}</b></div>
        <div>Department: <b className="text-[var(--ink)]">{form.department || 'Unassigned'}</b> · Role: <b className="text-[var(--ink)]">{form.role || '—'}</b></div>
        <div>Employee code: <b className="text-[var(--ink)]">{employee?.employeeCode ?? '—'}</b></div>
      </div>

      <form onSubmit={save} className="space-y-6 font-serif-body text-[14px]">
        <div className="border border-[var(--ink)] bg-[var(--panel)] p-6 space-y-4">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Personal Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Name</label>
              <input type="text" value={form.name} onChange={e => field('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => field('dob', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <input
                type="text" list="settings-gender" value={form.gender}
                onChange={e => field('gender', e.target.value)} className={inputClass}
              />
              <datalist id="settings-gender">
                <option value="Male" /><option value="Female" /><option value="Non-binary" /><option value="Prefer not to say" />
              </datalist>
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={form.city} onChange={e => field('city', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Alternative Phone</label>
              <input type="tel" value={form.altPhone} onChange={e => field('altPhone', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Personal Email</label>
              <input type="email" value={form.personalEmail} onChange={e => field('personalEmail', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Home Address</label>
              <input type="text" value={form.address} onChange={e => field('address', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border border-[var(--ink)] bg-[var(--panel)] p-6 space-y-4">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Work &amp; Role
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <input
                type="text" list="settings-dept" value={form.department}
                onChange={e => field('department', e.target.value)} className={inputClass}
              />
              <datalist id="settings-dept">
                {departments.map(d => <option key={d.id} value={d.name} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <input
                type="text" list="settings-role" value={form.role}
                onChange={e => field('role', e.target.value)} className={inputClass}
              />
              <datalist id="settings-role">
                {roles.map(r => <option key={r.id} value={r.name} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Level</label>
              <input type="text" value={form.level} onChange={e => field('level', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reports To</label>
              <input
                type="text" list="settings-manager" value={form.managerName}
                onChange={e => field('managerName', e.target.value)} className={inputClass}
              />
              <datalist id="settings-manager">
                {humanEmployees.filter(h => h.name !== form.name).map(h => <option key={h.id} value={h.name} />)}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Skills</label>
              <input type="text" value={form.skills} onChange={e => field('skills', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea rows={2} value={form.bio} onChange={e => field('bio', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border border-[var(--ink)] bg-[var(--panel)] p-6 space-y-4">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Preferences
          </h3>

          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <label className={labelClass}>Notifications</label>
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
          </div>

          <p className="font-mono-custom text-[10px] text-[var(--muted)] m-0 pt-2 border-t border-[var(--rule)]">
            Password management: contact your manager or the HR team to rotate your login password.
          </p>
        </div>

        <div className="flex justify-end items-center gap-3">
          {error && <span className="font-mono-custom text-[11px] text-[var(--bad)] font-bold">{error}</span>}
          {saved && (
            <span className="font-mono-custom text-[11px] text-[var(--good)] font-bold">
              ✓ Profile saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[11px] font-bold hover:opacity-90 transition shadow-sm disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Profile →'}
          </button>
        </div>
      </form>
    </div>
  );
};

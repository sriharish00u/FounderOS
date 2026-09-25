import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

interface AuthPageProps {
  onBack: () => void;
  initialTab?: Tab;
}

type Tab = 'login' | 'register';

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, initialTab = 'login' }) => {
  const { login, register } = useApp();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderEmail, setFounderEmail] = useState('');
  const [founderPhone, setFounderPhone] = useState('');
  const [founderPassword, setFounderPassword] = useState('');

  const switchTab = (next: Tab) => {
    setTab(next);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!companyName.trim() || !founderName.trim() || !founderEmail.trim() || !founderPassword) {
      setError('Company name, founder name, email, and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        company: {
          name: companyName.trim(),
          type: companyType.trim(),
          address: companyAddress.trim()
        },
        founder: {
          name: founderName.trim(),
          email: founderEmail.trim(),
          phone: founderPhone.trim() || undefined,
          password: founderPassword
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-transparent border border-[var(--rule)] px-3 py-2 text-[14px] font-serif-body outline-none focus:border-[var(--ink)] placeholder:text-[var(--muted)]';
  const labelClass = 'block font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5';

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-serif-body flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--rule)]">
        <div className="flex items-center gap-2 font-mono-custom text-[11px] uppercase tracking-[0.18em]">
          <span className="text-[var(--accent)]">◆</span>
          Founder Os
        </div>
        <button
          onClick={onBack}
          className="font-mono-custom text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back To Home
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-serif-display text-3xl text-center">
            {tab === 'login' ? 'Welcome Back' : 'Register Your Company'}
          </h1>
          <p className="mt-2 text-center text-[13px] text-[var(--muted)]">
            {tab === 'login'
              ? 'Sign in to your company operating system'
              : 'Create a company workspace, then hire your team'}
          </p>

          <div className="mt-8 border border-[var(--rule)] bg-[var(--panel)] p-6">
            <div className="grid grid-cols-2 border border-[var(--rule)]">
              <button
                onClick={() => switchTab('login')}
                className={`py-2.5 font-mono-custom text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  tab === 'login' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`py-2.5 font-mono-custom text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  tab === 'register' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <p className="mt-4 border border-[var(--bad)] bg-[#f6deda] px-3 py-2 text-[12px] text-[var(--bad)]">
                {error}
              </p>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="founder@company.com"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[12px] uppercase tracking-[0.16em] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-5 space-y-4">
                <fieldset>
                  <legend className={labelClass}>Your Company</legend>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="Company name"
                      className={inputClass}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={companyType}
                        onChange={e => setCompanyType(e.target.value)}
                        placeholder="Type"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={e => setCompanyAddress(e.target.value)}
                        placeholder="Location"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className={labelClass}>Founder Account</legend>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={founderName}
                      onChange={e => setFounderName(e.target.value)}
                      placeholder="Your full name"
                      className={inputClass}
                      required
                    />
                    <input
                      type="email"
                      value={founderEmail}
                      onChange={e => setFounderEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={inputClass}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={founderPhone}
                        onChange={e => setFounderPhone(e.target.value)}
                        placeholder="Phone"
                        className={inputClass}
                      />
                      <input
                        type="password"
                        value={founderPassword}
                        onChange={e => setFounderPassword(e.target.value)}
                        placeholder="Password"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[12px] uppercase tracking-[0.16em] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating Workspace…' : 'Create Company Workspace'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
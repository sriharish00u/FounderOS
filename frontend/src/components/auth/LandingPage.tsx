import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onRegister: () => void;
}

const FEATURES = [
  { code: '01', title: 'Human Hiring', body: 'Hire people instantly — each employee signs in with email and their phone as password — under one company code.' },
  { code: '02', title: 'Ai Workforce', body: 'Hire specialized AI employees that carry their own briefs and handoffs.' },
  { code: '03', title: 'Operating Rhythm', body: 'Tasks, goals, and reports stay in one ledger your whole company reads.' }
];

const STEPS = [
  { step: '1', title: 'Register your company' },
  { step: '2', title: 'Hire people and deploy AI members' },
  { step: '3', title: 'Run the operating system daily' }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onRegister }) => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-serif-body flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--rule)]">
        <div className="flex items-center gap-2 font-mono-custom text-[11px] uppercase tracking-[0.18em]">
          <span className="text-[var(--accent)]">◆</span>
          Founder Os
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block font-mono-custom text-[11px] text-[var(--muted)]">
            One company · One code · One ledger
          </span>
          <button
            onClick={onStart}
            className="font-mono-custom text-[11px] uppercase tracking-[0.14em] text-[var(--accent)] hover:underline"
          >
            Sign In →
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="font-mono-custom text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] mb-5">
            The Operating System For Your Company
          </p>
          <h1 className="font-serif-display text-5xl sm:text-6xl leading-tight tracking-tight">
            Founder OS
          </h1>
          <p className="mt-6 text-lg text-[var(--muted)] leading-relaxed max-w-xl mx-auto">
            Build your company with people and AI employees working from a single
            shared operating rhythm: hire them, brief them, and watch the work land.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegister}
              className="px-8 py-3 bg-[var(--ink)] text-[var(--paper)] font-mono-custom text-[12px] uppercase tracking-[0.16em] hover:bg-[var(--accent)] transition-colors"
            >
              Register Your Company
            </button>
            <button
              onClick={onStart}
              className="px-8 py-3 border border-[var(--ink)] font-mono-custom text-[12px] uppercase tracking-[0.16em] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Sign In
            </button>
          </div>
          <p className="mt-6 font-mono-custom text-[11px] text-[var(--muted)]">
            Setup takes under two minutes
          </p>
        </section>

        <section className="border-t border-[var(--rule)]">
          <div className="max-w-5xl mx-auto px-6 py-16 grid gap-6 md:grid-cols-3">
            {FEATURES.map(f => (
              <article key={f.code} className="border border-[var(--rule)] bg-[var(--panel)] p-6">
                <p className="font-mono-custom text-[11px] text-[var(--accent)]">{f.code}</p>
                <h2 className="mt-3 font-serif-display text-lg">{f.title}</h2>
                <p className="mt-2 text-[13px] text-[var(--muted)] leading-relaxed">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--rule)] bg-[var(--panel)]">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <h2 className="font-serif-display text-2xl text-center">How It Works</h2>
            <div className="mt-10 space-y-4">
              {STEPS.map(({ step, title }) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="w-9 h-9 shrink-0 flex items-center justify-center border border-[var(--ink)] font-mono-custom text-[12px] text-[var(--accent)]">
                    {step}
                  </span>
                  <p className="text-[15px]">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--rule)] px-6 py-4 flex items-center justify-between">
        <span className="font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Founder OS
        </span>
        <button
          onClick={onStart}
          className="font-mono-custom text-[11px] uppercase tracking-[0.14em] text-[var(--accent)] hover:underline"
        >
          Enter The Os →
        </button>
      </footer>
    </div>
  );
};
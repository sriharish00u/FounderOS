import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import type { ActiveView } from './context/AppContextInstance';
import type { UserRole } from './types';
import { LandingPage } from './components/auth/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CompanyDashboard } from './components/dashboard/CompanyDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { EmployeeTodosView } from './components/dashboard/EmployeeTodosView';
import { TasksView } from './components/tasks/TasksView';
import { StrategyView } from './components/strategy/StrategyView';
import { CRMView } from './components/crm/CRMView';
import { FinanceView } from './components/finance/FinanceView';
import { PeopleView } from './components/people/PeopleView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { HireAIModal } from './components/ai/HireAIModal';
import { AIMemoryModal } from './components/ai/AIMemoryModal';

const ROLE_VIEWS: Record<UserRole, ActiveView[]> = {
  founder: ['dashboard', 'crm', 'tasks', 'todos', 'finance', 'strategy', 'goals', 'people', 'reports', 'settings'],
  co_founder: ['dashboard', 'crm', 'tasks', 'todos', 'finance', 'strategy', 'goals', 'people', 'reports', 'settings'],
  manager: ['dashboard', 'crm', 'tasks', 'todos', 'finance', 'strategy', 'goals', 'people', 'reports'],
  employee: ['dashboard', 'tasks', 'todos', 'strategy', 'goals', 'people', 'reports', 'settings'],
  ai: ['todos']
};

const MainLayout: React.FC = () => {
  const { activeView, auth } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const role: UserRole = auth.phase === 'authenticated' ? auth.user.role : 'employee';
  const allowed = ROLE_VIEWS[role] ?? ['dashboard'];
  const view: ActiveView = allowed.includes(activeView) ? activeView : 'dashboard';

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col font-serif-body selection:bg-[var(--accent)] selection:text-[var(--paper)]">
      <Header onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 min-h-[calc(100vh-44px)]">
        <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-[var(--paper)] min-w-0">
          {view === 'dashboard' && (role === 'employee' ? <EmployeeDashboard /> : <CompanyDashboard />)}
          {view === 'crm' && <CRMView />}
          {view === 'tasks' && <TasksView />}
          {view === 'todos' && <EmployeeTodosView />}
          {view === 'finance' && <FinanceView />}
          {(view === 'strategy' || view === 'goals') && <StrategyView />}
          {view === 'people' && <PeopleView />}
          {view === 'reports' && <ReportsView />}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>

      <TaskDetailModal />
      <CreateTaskModal />
      <HireAIModal />
      <AIMemoryModal />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { auth } = useApp();
  const [screen, setScreen] = useState<'landing' | 'login' | 'register'>('landing');

  if (auth.phase === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center font-mono-custom text-[11px] tracking-[0.2em] text-[var(--muted)]">
        Loading Founder Os…
      </div>
    );
  }

  if (auth.phase === 'unauthenticated') {
    if (screen === 'landing') {
      return <LandingPage onStart={() => setScreen('login')} onRegister={() => setScreen('register')} />;
    }
    return (
      <AuthPage
        onBack={() => setScreen('landing')}
        initialTab={screen === 'register' ? 'register' : 'login'}
      />
    );
  }

  if (auth.phase === 'authenticated' && auth.user.mustChangePassword) {
    return <OnboardingWizard />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AuthGate />
    </AppProvider>
  );
}

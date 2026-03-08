import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/helpers';

export function MainLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  const ml = sidebarOpen ? 'ml-[var(--sidebar-w)]' : 'ml-[var(--sidebar-collapsed)]';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <Sidebar />

      <div className={cn('relative min-h-screen transition-[margin] duration-300 ease-in-out', ml)}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute top-1/3 left-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <Header />

        <main className="relative min-h-[calc(100vh-64px)] px-4 pb-8 pt-[88px] sm:px-6 xl:px-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
import {
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Code2,
  LayoutDashboard,
  UserCircle2,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Practice', path: '/app/practice', icon: Code2 },
  { label: 'Assessments', path: '/app/assessments', icon: ClipboardCheck },
  { label: 'Resources', path: '/app/resources', icon: BookOpen },
  { label: 'Job Tracker', path: '/app/jobs', icon: Briefcase },
  { label: 'Profile', path: '/app/profile', icon: UserCircle2 },
];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-8 sm:px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">
            Job Ecosystem
          </Link>
          <nav className="mt-8 space-y-2" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
            <h1 className="text-xl font-semibold text-slate-900">Job Ecosystem</h1>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-label="User avatar placeholder"
            >
              U
            </div>
          </header>

          <main className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

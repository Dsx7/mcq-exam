'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

import { LayoutDashboard, Users, ClipboardList, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/teachers', icon: Users, label: 'Teachers' },
  { href: '/admin/exams', icon: ClipboardList, label: 'All Exams' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Global Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-violet-800/20 flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-violet-800/20">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <p className="font-black text-white text-lg tracking-tight">ExamVault</p>
              <p className="text-xs text-violet-400 font-medium">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-violet-800/20">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">System Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@exam.com</p>
            </div>
          </div>
          <button
            onClick={async () => {
              toast.info('Logging out...');
              await signOut({ redirect: false });
              window.location.href = '/login';
            }}
            className="w-full btn-secondary py-2 text-sm justify-center"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

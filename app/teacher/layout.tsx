'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

import { LayoutDashboard, FileQuestion, ClipboardList, PlusCircle, Palette } from 'lucide-react';

const navItems = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/questions', icon: FileQuestion, label: 'Question Bank' },
  { href: '/teacher/exams', icon: ClipboardList, label: 'My Exams' },
  { href: '/teacher/exams/create', icon: PlusCircle, label: 'Create Exam' },
  { href: '/teacher/branding', icon: Palette, label: 'Branding' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-violet-800/20 flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-violet-800/20">
          <Link href="/teacher" className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <p className="font-black text-white text-lg tracking-tight">ExamVault</p>
              <p className="text-xs text-violet-400 font-medium">Teacher Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/teacher'
                ? pathname === '/teacher'
                : pathname.startsWith(item.href);
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

        <div className="p-4 border-t border-violet-800/20">
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

      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

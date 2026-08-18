'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      toast.error('Login Failed', { description: 'Invalid email or password.' });
      return;
    }

    // Fetch session to determine role
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();
    
    toast.success('Welcome Back!', { description: `Logged in as ${session?.user?.name || 'User'}` });

    if (session?.user?.role === 'admin') {
      router.push('/admin');
    } else if (session?.user?.role === 'teacher') {
      router.push('/teacher');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-700/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Logo size="xl" />
            <span className="text-3xl font-black gradient-text tracking-tight">ExamVault</span>
          </Link>
          <p className="text-slate-400 mt-3 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass glow-border rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Welcome Back</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="admin@exam.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <><span className="spinner" /> Signing in...</>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-sm">
              Are you a student?{' '}
              <span className="text-slate-400">
                Your teacher will share an exam link with you directly.
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-500 hover:text-violet-400 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

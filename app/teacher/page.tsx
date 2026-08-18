'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TeacherStats {
  totalQuestions: number;
  totalExams: number;
  activeExams: number;
  endedExams: number;
  totalStudents: number;
  recentExams: {
    _id: string;
    title: string;
    subject: string;
    status: string;
    slug: string;
    scheduledAt: string;
    duration: number;
    questionCount: number;
    submissionCount: number;
  }[];
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/teacher/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/exam/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const statCards = [
    { label: 'Questions', value: stats?.totalQuestions ?? 0, icon: '❓', color: 'from-violet-600 to-purple-700' },
    { label: 'Total Exams', value: stats?.totalExams ?? 0, icon: '📋', color: 'from-blue-600 to-indigo-700' },
    { label: 'Live Now', value: stats?.activeExams ?? 0, icon: '🔴', color: 'from-red-600 to-rose-700' },
    { label: 'Students', value: stats?.totalStudents ?? 0, icon: '🎓', color: 'from-emerald-600 to-teal-700' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">My Dashboard</h1>
          <p className="text-slate-400">Manage your questions, exams, and results.</p>
        </div>
        <Link href="/teacher/exams/create" className="btn-primary">
          + Create Exam
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="glass glow-border rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-xl shadow-glow`}>
                {s.icon}
              </div>
              <span className="text-3xl font-black text-white">{s.value}</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Exams */}
      <div className="glass glow-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">My Exams</h2>
          <Link href="/teacher/exams" className="text-violet-400 hover:text-violet-300 text-sm">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {(stats?.recentExams ?? []).map((exam) => (
            <div key={exam._id} className="bg-bg-elevated rounded-xl p-4 border border-violet-800/20 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-white truncate">{exam.title}</h3>
                  <span className={`badge-${exam.status} px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0`}>
                    {exam.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {exam.subject} · {exam.questionCount} questions · {exam.duration} min · {exam.submissionCount} students
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => copyLink(exam.slug)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-violet-600/40 text-violet-400 hover:bg-violet-600/15 transition-all"
                >
                  {copied === exam.slug ? '✓ Copied!' : '🔗 Copy Link'}
                </button>
                <Link href={`/teacher/exams/${exam._id}`} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-violet-600/40 transition-all">
                  Manage →
                </Link>
              </div>
            </div>
          ))}
          {(stats?.recentExams ?? []).length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 mb-4">No exams yet.</p>
              <Link href="/teacher/exams/create" className="btn-primary">
                Create Your First Exam
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

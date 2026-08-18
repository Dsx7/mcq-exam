'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminStats {
  totalTeachers: number;
  activeTeachers: number;
  totalExams: number;
  activeExams: number;
  endedExams: number;
  totalStudents: number;
  totalSubmissions: number;
  recentExams: {
    _id: string;
    title: string;
    subject: string;
    status: string;
    teacherName: string;
    scheduledAt: string;
    submissionCount: number;
  }[];
  examsBySubject: { subject: string; count: number }[];
  submissionsPerDay: { date: string; count: number }[];
}

const COLORS = ['#7c3aed', '#a78bfa', '#c084fc', '#8b5cf6', '#6d28d9', '#5b21b6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 w-10 h-10" style={{ width: 40, height: 40 }} />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: '👩‍🏫', color: 'from-violet-600 to-purple-700', sub: `${stats?.activeTeachers ?? 0} active` },
    { label: 'Total Exams', value: stats?.totalExams ?? 0, icon: '📋', color: 'from-blue-600 to-indigo-700', sub: `${stats?.activeExams ?? 0} live now` },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: '🎓', color: 'from-emerald-600 to-teal-700', sub: 'unique participants' },
    { label: 'Submissions', value: stats?.totalSubmissions ?? 0, icon: '✅', color: 'from-amber-600 to-orange-700', sub: 'all time' },
  ];

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">Full platform overview and control.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="glass glow-border rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-2xl shadow-glow`}>
                {s.icon}
              </div>
              <span className="text-3xl font-black text-white">{s.value.toLocaleString()}</span>
            </div>
            <p className="font-semibold text-white">{s.label}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Submissions per day */}
        <div className="lg:col-span-2 glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Daily Submissions (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.submissionsPerDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: '#f1f5f9' }}
              />
              <Bar dataKey="count" name="Submissions" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exams by subject */}
        <div className="glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Exams by Subject</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats?.examsBySubject ?? []}
                dataKey="count"
                nameKey="subject"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {(stats?.examsBySubject ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="glass glow-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Exams</h2>
          <Link href="/admin/exams" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Title</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Teacher</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Subject</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Students</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentExams ?? []).map((exam) => (
                <tr key={exam._id} className="border-b border-slate-800/50 table-row-hover">
                  <td className="py-3 px-3 text-white font-medium">{exam.title}</td>
                  <td className="py-3 px-3 text-slate-300">{exam.teacherName}</td>
                  <td className="py-3 px-3 text-slate-400">{exam.subject}</td>
                  <td className="py-3 px-3">
                    <span className={`badge-${exam.status} px-2 py-1 rounded-full text-xs font-medium`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{exam.submissionCount}</td>
                </tr>
              ))}
              {(stats?.recentExams ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No exams yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

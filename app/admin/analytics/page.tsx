'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#7c3aed', '#a78bfa', '#c084fc', '#8b5cf6', '#6d28d9', '#5b21b6'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Platform Analytics</h1>
        <p className="text-slate-400">System-wide insights and trends.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Daily Submissions (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.submissionsPerDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="count" name="Submissions" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Exams by Subject</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data?.examsBySubject ?? []} dataKey="count" nameKey="subject" cx="50%" cy="50%" outerRadius={90}>
                {(data?.examsBySubject ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Teachers', value: data?.totalTeachers ?? 0, icon: '👩‍🏫' },
          { label: 'Active Exams', value: data?.activeExams ?? 0, icon: '🔴' },
          { label: 'Ended Exams', value: data?.endedExams ?? 0, icon: '✅' },
          { label: 'Total Submissions', value: data?.totalSubmissions ?? 0, icon: '📝' },
        ].map((s) => (
          <div key={s.label} className="glass glow-border rounded-2xl p-5 card-hover text-center">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-slate-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

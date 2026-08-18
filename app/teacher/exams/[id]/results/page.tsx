'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Result {
  _id: string;
  studentName: string;
  studentRoll: string;
  score: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  timeTaken: number;
  rank: number;
}

interface ExamResult {
  exam: {
    title: string;
    subject: string;
    duration: number;
    questionCount: number;
    totalMarks: number;
    endedAt: string;
    slug: string;
  };
  results: Result[];
  stats: {
    avgScore: number;
    avgPercentage: number;
    highestScore: number;
    lowestScore: number;
    passCount: number;
    failCount: number;
  };
  questionStats: { text: string; correct: number; wrong: number; unanswered: number }[];
}

const MEDAL = ['🥇', '🥈', '🥉'];
const COLORS = ['#10b981', '#ef4444', '#94a3b8'];

export default function ExamResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  useEffect(() => {
    fetch(`/api/teacher/exams/${id}/results`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const exportFile = async (type: 'excel' | 'pdf') => {
    setExporting(type);
    const res = await fetch(`/api/teacher/exams/${id}/export?type=${type}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${id}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!data) return (
    <div className="p-8 text-slate-400">Results not found or exam not ended.</div>
  );

  const { exam, results, stats, questionStats } = data;
  const pieData = [
    { name: 'Pass', value: stats.passCount },
    { name: 'Fail', value: stats.failCount },
  ];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">{exam.title}</h1>
          <p className="text-slate-400">{exam.subject} · {exam.questionCount} questions · {exam.duration} min · {exam.totalMarks} total marks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportFile('excel')}
            disabled={exporting !== null}
            className="btn-secondary text-sm py-2"
          >
            {exporting === 'excel' ? 'Exporting...' : '📊 Export Excel'}
          </button>
          <button
            onClick={() => exportFile('pdf')}
            disabled={exporting !== null}
            className="btn-secondary text-sm py-2"
          >
            {exporting === 'pdf' ? 'Exporting...' : '📄 Export PDF'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Students', value: results.length, icon: '🎓' },
          { label: 'Avg Score', value: `${stats.avgScore}`, icon: '📊' },
          { label: 'Avg %', value: `${stats.avgPercentage}%`, icon: '📈' },
          { label: 'Highest', value: stats.highestScore, icon: '🏆' },
          { label: 'Pass', value: stats.passCount, icon: '✅' },
          { label: 'Fail', value: stats.failCount, icon: '❌' },
        ].map((s) => (
          <div key={s.label} className="glass glow-border rounded-xl p-4 text-center card-hover">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Score distribution */}
        <div className="lg:col-span-2 glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={results.map((r) => ({ name: r.studentRoll, score: r.score }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: '#f1f5f9' }}
              />
              <Bar dataKey="score" name="Score" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pass / Fail */}
        <div className="glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Pass / Fail</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question performance */}
      {questionStats.length > 0 && (
        <div className="glass glow-border rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Per-Question Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Question</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-green-400">Correct</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-red-400">Wrong</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Skipped</th>
                </tr>
              </thead>
              <tbody>
                {questionStats.map((q, i) => (
                  <tr key={i} className="border-b border-slate-800/40 table-row-hover">
                    <td className="py-3 px-4 text-slate-500">{i + 1}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{q.text}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">{q.correct}</td>
                    <td className="py-3 px-4 text-right text-red-400 font-semibold">{q.wrong}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{q.unanswered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ranking table */}
      <div className="glass glow-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">🏆 Student Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-bg-elevated/50">
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Rank</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Roll</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-right py-4 px-5 text-slate-400 font-medium">Score</th>
                <th className="text-right py-4 px-5 text-slate-400 font-medium">Correct</th>
                <th className="text-right py-4 px-5 text-slate-400 font-medium">Wrong</th>
                <th className="text-right py-4 px-5 text-slate-400 font-medium">%</th>
                <th className="text-right py-4 px-5 text-slate-400 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r._id}
                  className={`border-b border-slate-800/40 table-row-hover ${r.rank <= 3 ? 'bg-violet-500/5' : ''}`}
                >
                  <td className="py-4 px-5">
                    <span className="text-lg">{r.rank <= 3 ? MEDAL[r.rank - 1] : `#${r.rank}`}</span>
                  </td>
                  <td className="py-4 px-5 font-mono text-violet-400">{r.studentRoll}</td>
                  <td className="py-4 px-5 font-medium text-white">{r.studentName}</td>
                  <td className="py-4 px-5 text-right font-bold text-white">{r.score}</td>
                  <td className="py-4 px-5 text-right text-green-400">{r.correct}</td>
                  <td className="py-4 px-5 text-right text-red-400">{r.wrong}</td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 progress-bar">
                        <div className="progress-fill" style={{ width: `${r.percentage}%` }} />
                      </div>
                      <span className="text-slate-300">{r.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right text-slate-400">{formatTime(r.timeTaken)}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No submissions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

interface Exam {
  _id: string;
  title: string;
  subject: string;
  status: string;
  slug: string;
  scheduledAt: string;
  duration: number;
  submissionCount: number;
  teacherName: string;
  teacherEmail: string;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/exams')
      .then((r) => r.json())
      .then((d) => { setExams(d.exams ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = exams.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">All Exams</h1>
        <p className="text-slate-400">Monitor all exams across all teachers.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams..."
          className="input-base max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-40"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      <div className="glass glow-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-bg-elevated/50">
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Exam Title</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Teacher</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Subject</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Status</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Duration</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Students</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="spinner mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No exams found.</td>
                </tr>
              ) : (
                filtered.map((exam) => (
                  <tr key={exam._id} className="border-b border-slate-800/50 table-row-hover">
                    <td className="py-4 px-5 font-medium text-white">{exam.title}</td>
                    <td className="py-4 px-5 text-slate-300">{exam.teacherName}</td>
                    <td className="py-4 px-5 text-slate-400">{exam.subject}</td>
                    <td className="py-4 px-5">
                      <span className={`badge-${exam.status} px-2 py-1 rounded-full text-xs font-medium`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400">{exam.duration} min</td>
                    <td className="py-4 px-5 text-slate-300">{exam.submissionCount}</td>
                    <td className="py-4 px-5">
                      <a
                        href={`/exam/${exam.slug}`}
                        target="_blank"
                        className="text-violet-400 hover:text-violet-300 text-xs font-mono transition-colors"
                      >
                        /exam/{exam.slug}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

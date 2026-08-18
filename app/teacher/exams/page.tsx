'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Exam {
  _id: string;
  title: string;
  subject: string;
  status: string;
  slug: string;
  scheduledAt: string;
  duration: number;
  questionCount: number;
  submissionCount: number;
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchExams = () => {
    setLoading(true);
    fetch('/api/teacher/exams')
      .then((r) => r.json())
      .then((d) => { setExams(d.exams ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/exam/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const startExam = async (id: string) => {
    if (!confirm('Start this exam? Students will be able to join.')) return;
    const promise = fetch(`/api/teacher/exams/${id}/start`, { method: 'POST' }).then(() => fetchExams());
    
    toast.promise(promise, {
      loading: 'Starting exam...',
      success: 'Exam has started! Students can now join.',
      error: 'Failed to start exam',
    });
  };

  const endExam = async (id: string) => {
    if (!confirm('End this exam? This cannot be undone. Results will be calculated.')) return;
    const promise = fetch(`/api/teacher/exams/${id}/end`, { method: 'POST' }).then(() => fetchExams());

    toast.promise(promise, {
      loading: 'Ending exam & calculating results...',
      success: 'Exam ended! Results are ready.',
      error: 'Failed to end exam',
    });
  };

  const deleteExam = async (id: string) => {
    if (!confirm('Delete this exam? All data will be lost.')) return;
    await fetch(`/api/teacher/exams/${id}`, { method: 'DELETE' });
    fetchExams();
  };

  const filtered = exams.filter((e) => statusFilter === 'all' || e.status === statusFilter);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">My Exams</h1>
          <p className="text-slate-400">{exams.length} exams created</p>
        </div>
        <Link href="/teacher/exams/create" className="btn-primary">
          + Create Exam
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'active', 'ended'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              statusFilter === s
                ? 'bg-violet-600 text-white'
                : 'bg-bg-elevated text-slate-400 hover:text-white border border-violet-800/20'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Exam Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">
          <div className="spinner mx-auto mb-3" />
          Loading exams...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass glow-border rounded-2xl py-16 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-slate-400 mb-4">No exams found.</p>
          <Link href="/teacher/exams/create" className="btn-primary">
            Create Your First Exam
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((exam) => (
            <div key={exam._id} className="glass glow-border rounded-2xl p-6 card-hover">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{exam.title}</h3>
                    <span className={`badge-${exam.status} px-2 py-0.5 rounded-full text-xs font-medium`}>
                      {exam.status === 'active' && '● '}{exam.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span>📚 {exam.subject}</span>
                    <span>❓ {exam.questionCount} questions</span>
                    <span>⏱ {exam.duration} min</span>
                    <span>🎓 {exam.submissionCount} students</span>
                    <span>
                      🕐{' '}
                      {new Date(exam.scheduledAt).toLocaleString('en-BD', {
                        timeZone: 'Asia/Dhaka',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {/* Short link */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Share link:</span>
                    <code className="text-xs text-violet-400 bg-violet-900/20 px-2 py-1 rounded">
                      /exam/{exam.slug}
                    </code>
                    <button
                      onClick={() => copyLink(exam.slug)}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {copied === exam.slug ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {exam.status === 'draft' && (
                    <>
                      <button onClick={() => startExam(exam._id)} className="btn-success text-sm py-2">
                        ▶ Start Exam
                      </button>
                      <Link href={`/teacher/exams/${exam._id}`} className="btn-secondary text-sm py-2">
                        Edit
                      </Link>
                      <button onClick={() => deleteExam(exam._id)} className="btn-danger text-sm py-2">
                        Delete
                      </button>
                    </>
                  )}
                  {exam.status === 'active' && (
                    <>
                      <Link href={`/teacher/exams/${exam._id}/monitor`} className="btn-secondary text-sm py-2">
                        👁 Monitor
                      </Link>
                      <button onClick={() => endExam(exam._id)} className="btn-danger text-sm py-2">
                        ⏹ End Exam
                      </button>
                    </>
                  )}
                  {exam.status === 'ended' && (
                    <Link href={`/teacher/exams/${exam._id}/results`} className="btn-primary text-sm py-2">
                      📊 View Results
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

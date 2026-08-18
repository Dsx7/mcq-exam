'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  _id: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
}

interface Exam {
  _id: string;
  title: string;
  subject: string;
  duration: number;
  scheduledAt: string;
  status: string;
  questions: Question[];
  slug: string;
}

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ title: '', subject: '', duration: 30, scheduledAt: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/teacher/exams/${id}`).then((r) => r.json()),
      fetch('/api/teacher/questions').then((r) => r.json()),
    ]).then(([examData, qData]) => {
      if (examData.exam) {
        const e = examData.exam;
        setExam(e);
        const local = new Date(new Date(e.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16);
        setForm({ title: e.title, subject: e.subject, duration: e.duration, scheduledAt: local });
        setSelected(e.questions?.map((q: any) => (typeof q === 'string' ? q : q._id)) ?? []);
      }
      setAllQuestions(qData.questions ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) { setError('Select at least one question.'); return; }
    setSaving(true); setError('');
    const res = await fetch(`/api/teacher/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString(), questions: selected }),
    });
    setSaving(false);
    if (res.ok) router.push('/teacher/exams');
    else { const d = await res.json(); setError(d.error ?? 'Failed to save'); }
  };

  const copyLink = () => {
    if (!exam) return;
    navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!exam) return <div className="p-8 text-slate-400">Exam not found.</div>;

  if (exam.status !== 'draft') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-black text-white mb-4">{exam.title}</h1>
        <div className="glass glow-border rounded-2xl p-6">
          <p className="text-slate-400 mb-4">This exam is <span className="text-violet-400 font-semibold">{exam.status}</span> and cannot be edited.</p>
          <div className="flex items-center gap-3">
            <code className="text-violet-400 bg-violet-900/20 px-3 py-2 rounded-lg text-sm">/exam/{exam.slug}</code>
            <button onClick={copyLink} className="btn-secondary text-sm py-2">
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Edit Exam</h1>
          <div className="flex items-center gap-3">
            <code className="text-violet-400 bg-violet-900/20 px-2 py-1 rounded text-xs">/exam/{exam.slug}</code>
            <button onClick={copyLink} className="text-xs text-violet-400 hover:text-violet-300">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="glass glow-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5">Exam Details</h2>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-base" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-base" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                  <select value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    className="input-base">
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>{d >= 60 ? `${d / 60} hour${d > 60 ? 's' : ''}` : `${d} minutes`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Scheduled At (BD Time)</label>
                  <input type="datetime-local" value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="input-base" required />
                </div>
              </div>
            </div>
            <div className="glass glow-border rounded-2xl p-5">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Selected questions</span>
                <span className="text-white">{selected.length}</span>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
              {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
            </button>
          </div>

          <div className="lg:col-span-3">
            <div className="glass glow-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Questions <span className="text-violet-400">({selected.length} selected)</span></h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {allQuestions.map((q, i) => (
                  <label key={q._id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selected.includes(q._id) ? 'border-violet-500/60 bg-violet-500/10' : 'border-slate-700/40 bg-bg-elevated hover:border-violet-700/40'
                  }`}>
                    <input type="checkbox" checked={selected.includes(q._id)}
                      onChange={() => setSelected((prev) => prev.includes(q._id) ? prev.filter((x) => x !== q._id) : [...prev, q._id])}
                      className="mt-1 w-4 h-4 accent-violet-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="badge-draft text-xs px-2 py-0.5 rounded-full mr-2">{q.subject}</span>
                      <span className="text-xs text-violet-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                      <p className="text-sm text-slate-200 mt-1 line-clamp-2">{q.text}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

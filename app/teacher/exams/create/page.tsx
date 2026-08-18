'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  subject: string;
  text: string;
  marks: number;
  options: string[];
}

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export default function CreateExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    duration: 30,
    scheduledAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetch('/api/teacher/questions')
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []));
  }, []);

  // Set default scheduledAt to now + 5 min in Dhaka
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    // datetime-local format
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm((prev) => ({ ...prev, scheduledAt: local }));
  }, []);

  const toggleQuestion = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((q) => q._id));
    }
  };

  const totalMarks = questions
    .filter((q) => selected.includes(q._id))
    .reduce((sum, q) => sum + q.marks, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) { setError('Select at least one question.'); return; }
    setSaving(true); setError('');

    // Convert local datetime to ISO (BD timezone offset is +06:00)
    const scheduledDate = new Date(form.scheduledAt);

    const res = await fetch('/api/teacher/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        scheduledAt: scheduledDate.toISOString(),
        questions: selected,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Failed to create exam'); return; }
    router.push('/teacher/exams');
  };

  const subjects = [...new Set(questions.map((q) => q.subject))];
  const filtered = questions.filter((q) => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || q.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Create New Exam</h1>
        <p className="text-slate-400">Fill in details and select questions from your bank.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left — exam details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass glow-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5">Exam Details</h2>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Exam Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-base"
                    placeholder="e.g., Biology Mid-Term 2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-base"
                    placeholder="e.g., Biology"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    className="input-base"
                    required
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d >= 60 ? `${d / 60} hour${d > 60 ? 's' : ''}` : `${d} minutes`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Scheduled Start Time
                    <span className="text-slate-500 font-normal ml-1">(Bangladesh Time)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="input-base"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass glow-border rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3">Exam Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Questions selected</span>
                  <span className="text-white font-semibold">{selected.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total marks</span>
                  <span className="text-white font-semibold">{totalMarks}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration</span>
                  <span className="text-white font-semibold">{form.duration} min</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || selected.length === 0}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {saving ? <><span className="spinner" /> Creating...</> : '🚀 Create Exam'}
            </button>
          </div>

          {/* Right — question selector */}
          <div className="lg:col-span-3">
            <div className="glass glow-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  Select Questions
                  <span className="text-violet-400 ml-2">({selected.length} selected)</span>
                </h2>
                <button type="button" onClick={toggleAll} className="text-xs text-violet-400 hover:text-violet-300">
                  {selected.length === filtered.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="input-base flex-1 py-2 text-sm"
                />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="input-base w-36 py-2 text-sm"
                >
                  <option value="">All</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Questions */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No questions found. Add some first!</p>
                ) : (
                  filtered.map((q, i) => (
                    <label
                      key={q._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        selected.includes(q._id)
                          ? 'border-violet-500/60 bg-violet-500/10'
                          : 'border-slate-700/40 bg-bg-elevated hover:border-violet-700/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(q._id)}
                        onChange={() => toggleQuestion(q._id)}
                        className="mt-1 w-4 h-4 accent-violet-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-1">
                          <span className="text-xs text-slate-500">#{i + 1}</span>
                          <span className="badge-draft text-xs px-2 py-0.5 rounded-full">{q.subject}</span>
                          <span className="text-xs text-violet-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-sm text-slate-200 line-clamp-2">{q.text}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

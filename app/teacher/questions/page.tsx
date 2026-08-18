'use client';
import { useState, useEffect } from 'react';

interface Question {
  _id: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
  createdAt: string;
}

const emptyForm = {
  subject: '',
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  marks: 1,
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQuestions = () => {
    setLoading(true);
    fetch('/api/teacher/questions')
      .then((r) => r.json())
      .then((d) => { setQuestions(d.questions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, []);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (q: Question) => {
    setForm({
      subject: q.subject,
      text: q.text,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
      marks: q.marks,
    });
    setEditingId(q._id);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/teacher/questions/${editingId}` : '/api/teacher/questions';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Failed to save'); return; }
    setShowModal(false);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await fetch(`/api/teacher/questions/${id}`, { method: 'DELETE' });
    fetchQuestions();
  };

  const subjects = [...new Set(questions.map((q) => q.subject))];
  const filtered = questions.filter((q) => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || q.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Question Bank</h1>
          <p className="text-slate-400">{questions.length} questions total</p>
        </div>
        <button id="add-question-btn" onClick={openCreate} className="btn-primary">
          + Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="input-base max-w-xs"
        />
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="input-base w-48"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="spinner mx-auto mb-3" />
            Loading questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass glow-border rounded-2xl py-16 text-center">
            <p className="text-slate-500 mb-4">No questions found.</p>
            <button onClick={openCreate} className="btn-primary">Add Your First Question</button>
          </div>
        ) : (
          filtered.map((q, i) => (
            <div key={q._id} className="glass glow-border rounded-xl overflow-hidden">
              <div
                className="p-5 cursor-pointer flex items-start gap-4"
                onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
              >
                <div className="w-8 h-8 bg-violet-600/20 text-violet-400 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="badge-draft px-2 py-0.5 rounded-full text-xs">{q.subject}</span>
                    <span className="text-xs text-violet-400 bg-violet-900/30 px-2 py-0.5 rounded-full">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed line-clamp-2">{q.text}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(q); }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-violet-600/30 text-violet-400 hover:bg-violet-600/15 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(q._id); }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedId === q._id && (
                <div className="px-5 pb-5 border-t border-violet-800/20 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`text-sm px-4 py-2.5 rounded-lg border ${
                          idx === q.correctAnswer
                            ? 'border-green-500/50 bg-green-500/10 text-green-400'
                            : 'border-slate-700/50 bg-bg-elevated text-slate-300'
                        }`}
                      >
                        <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                        {idx === q.correctAnswer && <span className="ml-2 text-green-500">✓</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-300">
                      <span className="font-semibold">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="glass glow-border rounded-2xl p-8 w-full max-w-2xl my-8 animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Question' : 'Add New Question'}
            </h2>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Marks</label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: parseInt(e.target.value) || 1 })}
                    className="input-base"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Question Text</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="input-base resize-none"
                  rows={3}
                  placeholder="Write the question..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Options <span className="text-slate-500 font-normal">(click radio to mark correct answer)</span>
                </label>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={form.correctAnswer === idx}
                        onChange={() => setForm({ ...form, correctAnswer: idx })}
                        className="w-4 h-4 accent-violet-500 flex-shrink-0"
                      />
                      <span className="text-violet-400 font-bold w-5 flex-shrink-0">{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...form.options];
                          opts[idx] = e.target.value;
                          setForm({ ...form, options: opts });
                        }}
                        className={`input-base ${form.correctAnswer === idx ? 'border-green-500/50 bg-green-500/5' : ''}`}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  ✓ Selected: Option {String.fromCharCode(65 + form.correctAnswer)} (will be marked as correct answer)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Explanation <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="input-base resize-none"
                  rows={2}
                  placeholder="Explain the correct answer..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><span className="spinner" /> Saving...</> : editingId ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

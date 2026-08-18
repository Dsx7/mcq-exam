'use client';
import { useState, useEffect } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  examCount: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchTeachers = () => {
    setLoading(true);
    fetch('/api/admin/teachers')
      .then((r) => r.json())
      .then((d) => { setTeachers(d.teachers ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/admin/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Failed to create teacher'); return; }
    setShowModal(false);
    setForm({ name: '', email: '', password: '' });
    fetchTeachers();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/teachers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchTeachers();
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm('Delete this teacher? This action cannot be undone.')) return;
    await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
    fetchTeachers();
  };

  const filtered = teachers.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Teachers</h1>
          <p className="text-slate-400">Manage teacher accounts and access.</p>
        </div>
        <button
          id="add-teacher-btn"
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teachers..."
          className="input-base max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="glass glow-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-bg-elevated/50">
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Email</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Status</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Exams</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Joined</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="spinner mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="border-b border-slate-800/50 table-row-hover">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">
                          {t.name[0]}
                        </div>
                        <span className="font-medium text-white">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-300">{t.email}</td>
                    <td className="py-4 px-5">
                      <span className={`${t.isActive ? 'badge-active' : 'badge-ended'} px-2 py-1 rounded-full text-xs font-medium`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-300">{t.examCount ?? 0}</td>
                    <td className="py-4 px-5 text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' })}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(t._id, t.isActive)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            t.isActive
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/15'
                              : 'border-green-500/30 text-green-400 hover:bg-green-500/15'
                          }`}
                        >
                          {t.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteTeacher(t._id)}
                          className="text-xs px-3 py-1 rounded-full border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass glow-border rounded-2xl p-8 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">Add New Teacher</h2>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-base"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-base"
                  placeholder="teacher@school.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-base"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><span className="spinner" /> Creating...</> : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

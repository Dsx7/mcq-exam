'use client';
import { useState, useEffect } from 'react';

export default function TeacherBrandingPage() {
  const [branding, setBranding] = useState({
    instituteName: '',
    headerText: '',
    footerText: '',
    logoUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/teacher/branding')
      .then((r) => r.json())
      .then((d) => { if (d.branding) setBranding(d.branding); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/teacher/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branding),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setBranding((p) => ({ ...p, logoUrl: data.url }));
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Institute Branding</h1>
        <p className="text-slate-400">Customize how your exam looks to students.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Branding Settings</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Institute / School Name</label>
              <input type="text" value={branding.instituteName}
                onChange={(e) => setBranding({ ...branding, instituteName: e.target.value })}
                className="input-base" placeholder="e.g., Dhaka Model School" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Exam Header Text</label>
              <input type="text" value={branding.headerText}
                onChange={(e) => setBranding({ ...branding, headerText: e.target.value })}
                className="input-base" placeholder="e.g., Annual Examination 2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Footer Text</label>
              <input type="text" value={branding.footerText}
                onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                className="input-base" placeholder="e.g., Good luck! — Your Teacher" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Logo</label>
              {branding.logoUrl ? (
                <div className="flex items-center gap-4 p-4 bg-bg-elevated rounded-xl border border-violet-800/20">
                  <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto rounded-lg object-contain bg-white p-1" />
                  <button type="button" onClick={() => setBranding({ ...branding, logoUrl: '' })} className="btn-danger text-xs py-1 px-3">Remove</button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-violet-800/40 rounded-xl p-8 text-center hover:border-violet-600 transition-colors">
                    <p className="text-4xl mb-2">🖼️</p>
                    <p className="text-sm text-slate-300 font-medium">Click to upload logo</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              )}
              {uploading && <p className="text-violet-400 text-sm mt-2">Uploading...</p>}
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? <><span className="spinner" /> Saving...</> : saved ? '✓ Saved!' : 'Save Branding'}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="glass glow-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Live Preview</h2>
          <div className="rounded-xl overflow-hidden border border-violet-800/20">
            <div className="bg-gradient-to-r from-violet-900 to-purple-900 p-5 flex items-center gap-4">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto rounded-lg object-contain bg-white p-1" />
              ) : (
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-2xl">🏫</div>
              )}
              <div>
                <p className="font-black text-white text-lg">{branding.instituteName || 'Your Institute'}</p>
                <p className="text-violet-300 text-sm">{branding.headerText || 'Online Examination'}</p>
              </div>
            </div>
            <div className="bg-bg-card p-8 text-center">
              <p className="text-slate-400 text-sm">Your exam questions appear here</p>
            </div>
            <div className="bg-bg-elevated px-5 py-3 text-center">
              <p className="text-slate-500 text-xs">{branding.footerText || '© ExamVault'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

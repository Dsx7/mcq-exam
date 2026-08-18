'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Question {
  _id: string;
  text: string;
  options: string[];
  marks: number;
  subject: string;
}

interface ExamData {
  _id: string;
  title: string;
  subject: string;
  duration: number;
  status: 'draft' | 'active' | 'ended';
  startedAt?: string;
  questions: Question[];
  branding?: {
    instituteName: string;
    logoUrl?: string;
    headerText?: string;
    footerText?: string;
  };
}

type Phase = 'register' | 'exam' | 'submitted' | 'unavailable' | 'ended';

export default function StudentExamPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [phase, setPhase] = useState<Phase>('register');
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [regError, setRegError] = useState('');
  const [registering, setRegistering] = useState(false);

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingExam, setLoadingExam] = useState(true);

  const autoSubmittedRef = useRef(false);

  // Security: block context menu, copy, devtools
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);

    // Block F12, Ctrl+Shift+I, Ctrl+U
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) e.preventDefault();
      if (e.ctrlKey && e.key === 'u') e.preventDefault();
      if (e.ctrlKey && e.key === 'p') e.preventDefault(); // print
      if (e.ctrlKey && e.key === 's') e.preventDefault();
      if (e.ctrlKey && e.key === 'a') e.preventDefault();
    };
    document.addEventListener('keydown', blockKeys);

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  // Visibility change warning
  useEffect(() => {
    if (phase !== 'exam') return;
    const handleVisibility = () => {
      if (document.hidden) {
        alert('⚠️ Warning: Do not leave the exam tab! This may be flagged.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase]);

  const fetchExam = useCallback(async () => {
    try {
      const res = await fetch(`/api/exam/${slug}`);
      const data = await res.json();
      if (!res.ok || !data.exam) {
        setPhase('unavailable');
        setLoadingExam(false);
        return;
      }
      setExamData(data.exam);
      if (data.exam.status === 'ended') setPhase('ended');
      else if (data.exam.status !== 'active') setPhase('unavailable');
      setLoadingExam(false);
    } catch {
      setPhase('unavailable');
      setLoadingExam(false);
    }
  }, [slug]);

  useEffect(() => { fetchExam(); }, [fetchExam]);

  // Compute timeLeft from server startedAt + duration
  useEffect(() => {
    if (!examData?.startedAt || !examData?.duration || phase !== 'exam') return;
    const endMs = new Date(examData.startedAt).getTime() + examData.duration * 60000;
    const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    setTimeLeft(remaining);
  }, [examData, phase]);

  // Countdown
  useEffect(() => {
    if (phase !== 'exam' || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  const handleAutoSubmit = async () => {
    if (!submissionId) return;
    await fetch(`/api/exam/${slug}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, answers, autoSubmit: true }),
    });
    setPhase('submitted');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(''); setRegistering(true);

    const res = await fetch(`/api/exam/${slug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: studentName.trim(), studentRoll: studentRoll.trim() }),
    });
    const data = await res.json();
    setRegistering(false);

    if (!res.ok) { setRegError(data.error ?? 'Failed to join exam'); return; }
    setSubmissionId(data.submissionId);
    setPhase('exam');
  };

  const handleAnswer = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = async () => {
    if (!submissionId || submitting) return;
    if (!confirm('Submit your exam? You cannot change answers after submission.')) return;
    setSubmitting(true);
    await fetch(`/api/exam/${slug}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, answers }),
    });
    setSubmitting(false);
    setPhase('submitted');
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = examData?.questions.length ?? 0;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // ── Loading ──
  if (loadingExam) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
          <p className="text-slate-400">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ── Ended ──
  if (phase === 'ended') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-4">
        <div className="glass glow-border rounded-3xl p-12 text-center max-w-md w-full animate-slide-up">
          <div className="text-6xl mb-6">🏁</div>
          <h1 className="text-2xl font-black text-white mb-3">Exam is Over</h1>
          <p className="text-slate-400 mb-2">This exam has ended.</p>
          <p className="text-slate-500 text-sm">Results will be shared by your teacher.</p>
        </div>
      </div>
    );
  }

  // ── Unavailable ──
  if (phase === 'unavailable') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full animate-slide-up">
          {/* Branding header if available */}
          {examData?.branding && (
            <div className="glass glow-border rounded-2xl p-5 mb-5 flex items-center gap-4">
              {examData.branding.logoUrl && (
                <img src={examData.branding.logoUrl} alt="Logo" className="h-10 w-auto rounded object-contain bg-white p-0.5" />
              )}
              <div>
                <p className="font-bold text-white">{examData.branding.instituteName}</p>
                <p className="text-violet-300 text-sm">{examData.branding.headerText}</p>
              </div>
            </div>
          )}

          <div className="glass glow-border rounded-3xl p-8 text-center">
            <div className="text-5xl mb-5">⏳</div>
            <h1 className="text-2xl font-black text-white mb-3">
              {examData ? examData.title : 'Exam Unavailable'}
            </h1>
            <p className="text-slate-400 mb-2">This exam is not currently active.</p>
            <p className="text-slate-500 text-sm">Please wait for your teacher to start the exam.</p>

            {/* Roll / Name form — collect but don't let them in */}
            <div className="mt-8 border-t border-slate-700/50 pt-6">
              <p className="text-xs text-slate-500 mb-4">
                Enter your details below. You will be admitted when the exam begins.
              </p>
              <div className="space-y-3 text-left">
                <input type="text" value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)}
                  className="input-base" placeholder="Roll Number" />
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="input-base" placeholder="Full Name" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Submitted ──
  if (phase === 'submitted') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-4">
        <div className="glass glow-border rounded-3xl p-12 text-center max-w-md w-full animate-slide-up">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-black text-white mb-3">Exam Submitted!</h1>
          <p className="text-slate-400 mb-2">Your answers have been recorded successfully.</p>
          <p className="text-slate-500 text-sm">Results will be shared by your teacher after the exam ends.</p>
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              <span className="text-white font-semibold">{studentName}</span> · Roll: <span className="text-violet-400 font-mono">{studentRoll}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Register ──
  if (phase === 'register') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-4 no-select">
        <div className="max-w-md w-full animate-slide-up">
          {/* Branding */}
          {examData?.branding?.instituteName && (
            <div className="glass glow-border rounded-2xl p-5 mb-5 flex items-center gap-4">
              {examData.branding.logoUrl && (
                <img src={examData.branding.logoUrl} alt="Logo" className="h-10 w-auto rounded object-contain bg-white p-0.5" />
              )}
              <div>
                <p className="font-bold text-white">{examData.branding.instituteName}</p>
                <p className="text-violet-300 text-sm">{examData.branding.headerText}</p>
              </div>
            </div>
          )}

          <div className="glass glow-border rounded-2xl p-8">
            <h1 className="text-2xl font-black text-white mb-1">{examData?.title}</h1>
            <p className="text-slate-400 mb-1">{examData?.subject}</p>
            <div className="flex gap-4 text-sm text-slate-500 mb-6">
              <span>⏱ {examData?.duration} min</span>
              <span>❓ {examData?.questions.length} questions</span>
            </div>

            {regError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Roll Number</label>
                <input
                  type="text"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="input-base"
                  placeholder="Enter your roll number"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="input-base"
                  placeholder="Enter your full name"
                  required
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={registering} className="btn-primary w-full justify-center py-3">
                {registering ? <><span className="spinner" /> Joining...</> : 'Join Exam →'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>🔒</span>
                <span>This exam uses anti-copy protection. Do not open DevTools or switch tabs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Exam ──
  const question = examData!.questions[current];
  const isUrgent = timeLeft > 0 && timeLeft < 300;
  const isVeryUrgent = timeLeft > 0 && timeLeft < 60;

  return (
    <div className="min-h-screen bg-bg-base no-select" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      {/* Sticky header */}
      <header className="sticky top-0 z-40 glass border-b border-violet-800/20 shadow-card">
        {/* Institute branding */}
        {examData?.branding?.instituteName && (
          <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 px-6 py-2 flex items-center gap-3">
            {examData.branding.logoUrl && (
              <img src={examData.branding.logoUrl} alt="Logo" className="h-7 w-auto rounded object-contain bg-white p-0.5" />
            )}
            <span className="text-sm font-semibold text-violet-200">{examData.branding.instituteName}</span>
            {examData.branding.headerText && (
              <span className="text-sm text-violet-400">— {examData.branding.headerText}</span>
            )}
          </div>
        )}

        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-bold text-white truncate">{examData?.title}</h1>
            <p className="text-xs text-slate-400">{studentName} · Roll: {studentRoll}</p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-lg font-black ${
            isVeryUrgent
              ? 'border-red-500/60 bg-red-500/15 text-red-400 animate-pulse'
              : isUrgent
              ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
              : 'border-violet-500/40 bg-violet-500/10 text-violet-400'
          }`}>
            {timeLeft === 0 ? (
              <span className="text-slate-500">Time&apos;s up</span>
            ) : (
              <>
                {isVeryUrgent && <span>🔴</span>}
                {isUrgent && !isVeryUrgent && <span>⚠️</span>}
                {formatTime(timeLeft)}
              </>
            )}
          </div>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-400">{answeredCount}/{totalQuestions}</span>
            <div className="w-32 progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-sm text-violet-400">{progressPct}%</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-6">
        {/* Question panel */}
        <div className="flex-1 min-w-0">
          {question && (
            <div className="glass glow-border rounded-2xl p-8 animate-slide-up">
              <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{question.subject}</span>
                  <p className="text-sm text-violet-400 mt-1">Question {current + 1} of {totalQuestions} · {question.marks} mark{question.marks > 1 ? 's' : ''}</p>
                </div>
                {answers[question._id] !== undefined && (
                  <span className="badge-active px-3 py-1 rounded-full text-xs flex-shrink-0">Answered</span>
                )}
              </div>

              <p className="text-white text-lg font-medium leading-relaxed mb-8">
                {question.text}
              </p>

              <div className="space-y-3">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(question._id, idx)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-4 ${
                      answers[question._id] === idx
                        ? 'border-violet-500 bg-violet-500/20 text-white shadow-glow'
                        : 'border-slate-700/50 bg-bg-elevated text-slate-300 hover:border-violet-600/50 hover:bg-violet-600/10'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      answers[question._id] === idx
                        ? 'bg-violet-500 text-white'
                        : 'bg-bg-base text-slate-400 border border-slate-700'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answers[question._id] === idx && (
                      <span className="text-violet-400 text-lg flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
                <button
                  onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                  disabled={current === 0}
                  className="btn-secondary py-2 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="text-sm text-slate-400">
                  {answeredCount} of {totalQuestions} answered
                </div>
                {current < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrent((p) => p + 1)}
                    className="btn-primary py-2 px-5 text-sm"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-success py-2 px-5 text-sm"
                  >
                    {submitting ? 'Submitting...' : '✓ Submit Exam'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question navigator */}
        <div className="hidden lg:block w-52 flex-shrink-0">
          <div className="glass glow-border rounded-2xl p-4 sticky top-32">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {examData?.questions.map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-md text-xs font-semibold transition-all ${
                    i === current
                      ? 'bg-violet-600 text-white shadow-glow'
                      : answers[q._id] !== undefined
                      ? 'bg-green-600/30 text-green-400 border border-green-600/40'
                      : 'bg-bg-elevated text-slate-400 border border-slate-700/50 hover:border-violet-600/40'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3 h-3 rounded bg-violet-600" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3 h-3 rounded bg-green-600/30 border border-green-600/40" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3 h-3 rounded bg-bg-elevated border border-slate-700/50" />
                <span>Unanswered</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-success w-full text-xs py-2 mt-4 justify-center"
            >
              {submitting ? 'Submitting...' : '✓ Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      {examData?.branding?.footerText && (
        <footer className="border-t border-slate-800/50 py-3 px-6 text-center">
          <p className="text-slate-500 text-xs">{examData.branding.footerText}</p>
        </footer>
      )}
    </div>
  );
}

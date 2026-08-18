'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Pusher from 'pusher-js';
import { Users } from 'lucide-react';

interface Submission {
  _id: string;
  studentName: string;
  studentRoll: string;
  submittedAt?: string;
  score: number;
  correct: number;
  wrong: number;
  percentage: number;
}

interface ExamMeta {
  title: string;
  subject: string;
  status: string;
  duration: number;
  startedAt?: string;
  questionCount: number;
}

export default function ExamMonitorPage() {
  const params = useParams();
  const id = params.id as string;
  const [exam, setExam] = useState<ExamMeta | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    const [examRes, subsRes] = await Promise.all([
      fetch(`/api/teacher/exams/${id}`),
      fetch(`/api/teacher/exams/${id}/submissions`),
    ]);
    const examData = await examRes.json();
    const subsData = await subsRes.json();
    setExam(examData.exam);
    setSubmissions(subsData.submissions ?? []);

    if (examData.exam?.startedAt && examData.exam?.duration) {
      const endTime = new Date(examData.exam.startedAt).getTime() + examData.exam.duration * 60000;
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }
  }, [id]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Setup Pusher WebSocket
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';
    
    if (pusherKey && pusherKey !== 'your_key') {
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });
      
      const channel = pusher.subscribe(`exam-${id}`);
      channel.bind('new-submission', () => {
        // Instantly refresh data when a real-time event is received
        fetchData();
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    } else {
      // Fallback polling if Pusher is not configured
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchData, id]);

  // Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const submitted = submissions.filter((s) => s.submittedAt).length;

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Live Monitor</h1>
        <p className="text-slate-400">{exam?.title}</p>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass glow-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-white">{submissions.length}</p>
          <p className="text-slate-400 text-sm mt-1">Total Joined</p>
        </div>
        <div className="glass glow-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-green-400">{submitted}</p>
          <p className="text-slate-400 text-sm mt-1">Submitted</p>
        </div>
        <div className="glass glow-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-yellow-400">{submissions.length - submitted}</p>
          <p className="text-slate-400 text-sm mt-1">In Progress</p>
        </div>
        <div className="glass glow-border rounded-2xl p-5 text-center">
          {timeLeft !== null ? (
            <p className={`text-3xl font-black font-mono ${timeLeft < 300 ? 'timer-urgent' : 'text-violet-400'}`}>
              {formatTime(timeLeft)}
            </p>
          ) : (
            <p className="text-3xl font-black text-slate-500">--:--</p>
          )}
          <p className="text-slate-400 text-sm mt-1">Time Remaining</p>
        </div>
      </div>

      {/* Student list */}
      <div className="glass glow-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="font-bold text-white">Participants</h2>
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Connection
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-bg-elevated/50">
                <th className="text-left py-3 px-5 text-slate-400 font-medium">Roll</th>
                <th className="text-left py-3 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 px-5 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-5 text-slate-400 font-medium">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-3">
                      <Users className="w-8 h-8 opacity-50" />
                    </div>
                    Waiting for students to join...
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s._id} className="border-b border-slate-800/40 table-row-hover">
                    <td className="py-3 px-5 font-mono text-violet-400">{s.studentRoll}</td>
                    <td className="py-3 px-5 text-white">{s.studentName}</td>
                    <td className="py-3 px-5">
                      {s.submittedAt ? (
                        <span className="badge-active px-2 py-0.5 rounded-full text-xs">Submitted</span>
                      ) : (
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full">In Progress</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-slate-400">
                      {s.submittedAt
                        ? new Date(s.submittedAt).toLocaleTimeString('en-BD', { timeZone: 'Asia/Dhaka' })
                        : '—'}
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

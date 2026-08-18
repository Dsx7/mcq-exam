import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';
import Question from '@/models/Question';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const exam = await Exam.findOne({ _id: id, teacherId: session.user.id }).populate('questions').lean();
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((exam as any).status !== 'ended') return NextResponse.json({ error: 'Exam not ended yet' }, { status: 400 });

  const questions = (exam as any).questions as any[];
  const totalMarks = questions.reduce((s: number, q: any) => s + q.marks, 0);

  const submissions = await Submission.find({ examId: exam._id })
    .sort({ rank: 1 })
    .lean();

  const results = submissions.map((s: any) => ({
    _id: s._id.toString(),
    studentName: s.studentName,
    studentRoll: s.studentRoll,
    score: s.score,
    correct: s.correct,
    wrong: s.wrong,
    unanswered: s.unanswered,
    percentage: s.percentage,
    timeTaken: s.timeTaken,
    rank: s.rank,
  }));

  // Per-question stats
  const questionStats = questions.map((q: any) => {
    let correct = 0, wrong = 0, unanswered = 0;
    const qid = q._id.toString();
    for (const s of submissions) {
      const answersObj = s.answers instanceof Map ? Object.fromEntries(s.answers) : s.answers;
      const chosen = answersObj?.[qid];
      if (chosen === undefined || chosen === null) unanswered++;
      else if (chosen === q.correctAnswer) correct++;
      else wrong++;
    }
    return { text: q.text, correct, wrong, unanswered };
  });

  const scores = results.map((r) => r.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const avgPercentage = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passCount = results.filter((r) => r.percentage >= 33).length;
  const failCount = results.length - passCount;

  return NextResponse.json({
    exam: {
      title: (exam as any).title,
      subject: (exam as any).subject,
      duration: (exam as any).duration,
      questionCount: questions.length,
      totalMarks,
      endedAt: (exam as any).endedAt,
      slug: (exam as any).slug,
    },
    results,
    stats: { avgScore, avgPercentage, highestScore, lowestScore, passCount, failCount },
    questionStats,
  });
}

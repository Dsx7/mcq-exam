import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';
import Question from '@/models/Question';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const exam = await Exam.findOne({ _id: id, teacherId: session.user.id }).populate('questions');
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (exam.status !== 'active') return NextResponse.json({ error: 'Exam is not active' }, { status: 400 });

  exam.status = 'ended';
  exam.endedAt = new Date();
  await exam.save();

  // Calculate scores for all submissions
  const questions = exam.questions as any[];
  const submissions = await Submission.find({ examId: exam._id, submittedAt: { $exists: false } });

  // Auto-submit any remaining (time-expired) students
  for (const sub of submissions) {
    sub.submittedAt = new Date();
    await sub.save();
  }

  // Calculate scores for all
  const allSubs = await Submission.find({ examId: exam._id });
  const totalMarks = questions.reduce((s: number, q: any) => s + q.marks, 0);

  for (const sub of allSubs) {
    let correct = 0, wrong = 0, score = 0;
    const answersMap = sub.answers as Map<string, number>;

    for (const q of questions) {
      const qid = q._id.toString();
      const chosen = answersMap.get(qid);
      if (chosen === undefined) continue;
      if (chosen === q.correctAnswer) {
        correct++;
        score += q.marks;
      } else {
        wrong++;
      }
    }

    const unanswered = questions.length - correct - wrong;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const timeTaken = sub.submittedAt && exam.startedAt
      ? Math.floor((sub.submittedAt.getTime() - exam.startedAt.getTime()) / 1000)
      : exam.duration * 60;

    sub.score = score;
    sub.correct = correct;
    sub.wrong = wrong;
    sub.unanswered = unanswered;
    sub.percentage = percentage;
    sub.timeTaken = timeTaken;
    await sub.save();
  }

  // Assign ranks: sorted by score DESC, correct DESC, timeTaken ASC
  const sorted = (await Submission.find({ examId: exam._id }).sort({
    score: -1,
    correct: -1,
    timeTaken: 1,
  })).map((s, i) => ({ id: s._id, rank: i + 1 }));

  for (const r of sorted) {
    await Submission.findByIdAndUpdate(r.id, { rank: r.rank });
  }

  return NextResponse.json({ success: true });
}

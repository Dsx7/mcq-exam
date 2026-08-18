import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const submissions = await Submission.find({ examId: id })
    .select('-answers')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    submissions: submissions.map((s: any) => ({
      _id: s._id.toString(),
      studentName: s.studentName,
      studentRoll: s.studentRoll,
      submittedAt: s.submittedAt,
      score: s.score,
      correct: s.correct,
      wrong: s.wrong,
      percentage: s.percentage,
    })),
  });
}

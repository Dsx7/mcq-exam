import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const questions = await Question.find({ teacherId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    questions: questions.map((q: any) => ({
      ...q,
      _id: q._id.toString(),
      teacherId: q.teacherId.toString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const body = await req.json();
  const { subject, text, options, correctAnswer, explanation, marks } = body;

  if (!subject || !text || !options || options.length !== 4 || correctAnswer === undefined) {
    return NextResponse.json({ error: 'Invalid question data' }, { status: 400 });
  }

  const question = await Question.create({
    teacherId: session.user.id,
    subject,
    text,
    options,
    correctAnswer: Number(correctAnswer),
    explanation: explanation ?? '',
    marks: Number(marks) || 1,
  });

  return NextResponse.json({ question: { _id: question._id.toString(), ...body } }, { status: 201 });
}

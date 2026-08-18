import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const body = await req.json();

  const q = await Question.findOne({ _id: id, teacherId: session.user.id });
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  Object.assign(q, {
    subject: body.subject,
    text: body.text,
    options: body.options,
    correctAnswer: Number(body.correctAnswer),
    explanation: body.explanation ?? '',
    marks: Number(body.marks) || 1,
  });
  await q.save();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  await Question.findOneAndDelete({ _id: id, teacherId: session.user.id });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const body = await req.json();
  const exam = await Exam.findOne({ _id: id, teacherId: session.user.id, status: 'draft' });
  if (!exam) return NextResponse.json({ error: 'Not found or not editable' }, { status: 404 });

  exam.title = body.title;
  exam.subject = body.subject;
  exam.duration = Number(body.duration);
  exam.scheduledAt = new Date(body.scheduledAt);
  exam.questions = body.questions;
  await exam.save();

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const exam = await Exam.findOne({ _id: id, teacherId: session.user.id });
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (exam.status !== 'draft') return NextResponse.json({ error: 'Exam already started or ended' }, { status: 400 });

  exam.status = 'active';
  exam.startedAt = new Date();
  await exam.save();

  return NextResponse.json({ success: true });
}

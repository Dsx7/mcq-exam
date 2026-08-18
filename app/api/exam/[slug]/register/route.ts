import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const { studentName, studentRoll } = await req.json();

  if (!studentName?.trim() || !studentRoll?.trim()) {
    return NextResponse.json({ error: 'Name and roll are required' }, { status: 400 });
  }

  const exam = await Exam.findOne({ slug });
  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  if (exam.status !== 'active') {
    return NextResponse.json({ error: 'Exam is not active' }, { status: 403 });
  }

  // Check time gate
  if (exam.startedAt && exam.duration) {
    const endTime = new Date(exam.startedAt).getTime() + exam.duration * 60000;
    if (Date.now() > endTime) {
      return NextResponse.json({ error: 'Exam time has expired' }, { status: 403 });
    }
  }

  // Upsert submission record
  let submission = await Submission.findOne({ examId: exam._id, studentRoll: studentRoll.trim() });
  if (!submission) {
    submission = await Submission.create({
      examId: exam._id,
      studentName: studentName.trim(),
      studentRoll: studentRoll.trim(),
      answers: new Map(),
    });
  } else if (submission.submittedAt) {
    return NextResponse.json({ error: 'You have already submitted this exam.' }, { status: 400 });
  }

  return NextResponse.json({ submissionId: submission._id.toString() });
}

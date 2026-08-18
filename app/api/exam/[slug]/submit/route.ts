import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';

import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const { submissionId, answers } = await req.json();

  if (!submissionId) return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });

  const exam = await Exam.findOne({ slug });
  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

  const submission = await Submission.findById(submissionId);
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  if (submission.submittedAt) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
  }

  // Server-side time gate: even if client submits late, we still record the last known answers
  const now = Date.now();
  const endTime = exam.startedAt
    ? new Date(exam.startedAt).getTime() + exam.duration * 60000
    : Infinity;

  // Accept submission but mark time
  const answersMap = new Map<string, number>();
  if (answers && typeof answers === 'object') {
    for (const [key, val] of Object.entries(answers)) {
      if (typeof val === 'number') answersMap.set(key, val);
    }
  }

  submission.answers = answersMap;
  submission.submittedAt = new Date(Math.min(now, endTime)); // cap at exam end time
  await submission.save();

  // Trigger real-time WebSocket update for the Live Monitor
  try {
    await pusherServer.trigger(`exam-${exam._id.toString()}`, 'new-submission', {
      studentRoll: submission.studentRoll,
      name: submission.studentName,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error('Pusher trigger failed:', error);
  }

  return NextResponse.json({ success: true });
}

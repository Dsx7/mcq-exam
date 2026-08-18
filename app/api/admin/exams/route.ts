import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const exams = await Exam.find().sort({ createdAt: -1 }).populate('teacherId', 'name email').lean();

  const result = await Promise.all(
    exams.map(async (e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      subject: e.subject,
      status: e.status,
      slug: e.slug,
      scheduledAt: e.scheduledAt,
      duration: e.duration,
      submissionCount: await Submission.countDocuments({ examId: e._id }),
      teacherName: e.teacherId?.name ?? 'Unknown',
      teacherEmail: e.teacherId?.email ?? '',
    }))
  );

  return NextResponse.json({ exams: result });
}

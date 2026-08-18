import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const exams = await Exam.find({ teacherId: session.user.id }).sort({ createdAt: -1 }).lean();

  const result = await Promise.all(
    exams.map(async (e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      subject: e.subject,
      status: e.status,
      slug: e.slug,
      scheduledAt: e.scheduledAt,
      duration: e.duration,
      questionCount: e.questions?.length ?? 0,
      submissionCount: await Submission.countDocuments({ examId: e._id }),
    }))
  );

  return NextResponse.json({ exams: result });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { title, subject, duration, scheduledAt, questions } = await req.json();

  if (!title || !subject || !duration || !scheduledAt || !questions?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Generate unique slug
  let slug = nanoid();
  let exists = await Exam.findOne({ slug });
  while (exists) { slug = nanoid(); exists = await Exam.findOne({ slug }); }

  const exam = await Exam.create({
    teacherId: session.user.id,
    title,
    subject,
    duration: Number(duration),
    scheduledAt: new Date(scheduledAt),
    questions,
    slug,
    status: 'draft',
  });

  return NextResponse.json({ exam: { _id: exam._id.toString(), slug: exam.slug } }, { status: 201 });
}

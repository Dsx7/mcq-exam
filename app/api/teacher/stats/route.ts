import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';
import Question from '@/models/Question';

// GET /api/teacher/stats
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const teacherId = session.user.id;

  const [totalQuestions, exams] = await Promise.all([
    Question.countDocuments({ teacherId }),
    Exam.find({ teacherId }).sort({ createdAt: -1 }).lean(),
  ]);

  const examIds = exams.map((e: any) => e._id);
  const submissions = await Submission.find({ examId: { $in: examIds } }).lean();

  const recentExams = await Promise.all(
    exams.slice(0, 10).map(async (e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      subject: e.subject,
      status: e.status,
      slug: e.slug,
      scheduledAt: e.scheduledAt,
      duration: e.duration,
      questionCount: e.questions?.length ?? 0,
      submissionCount: submissions.filter((s: any) => s.examId.toString() === e._id.toString()).length,
    }))
  );

  const totalStudents = new Set(submissions.map((s: any) => s.studentRoll)).size;

  return NextResponse.json({
    totalQuestions,
    totalExams: exams.length,
    activeExams: exams.filter((e: any) => e.status === 'active').length,
    endedExams: exams.filter((e: any) => e.status === 'ended').length,
    totalStudents,
    recentExams,
  });
}

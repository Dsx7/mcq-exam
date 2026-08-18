import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectDB();

  const [
    totalTeachers,
    activeTeachers,
    totalExams,
    activeExams,
    endedExams,
    totalSubmissions,
  ] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    Exam.countDocuments(),
    Exam.countDocuments({ status: 'active' }),
    Exam.countDocuments({ status: 'ended' }),
    Submission.countDocuments(),
  ]);

  const totalStudents = await Submission.distinct('studentRoll').then((r) => r.length);

  // Recent exams with teacher info and submission counts
  const recentExamsRaw = await Exam.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('teacherId', 'name')
    .lean();

  const recentExams = await Promise.all(
    recentExamsRaw.map(async (e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      subject: e.subject,
      status: e.status,
      teacherName: (e.teacherId as any)?.name ?? 'Unknown',
      scheduledAt: e.scheduledAt,
      submissionCount: await Submission.countDocuments({ examId: e._id }),
    }))
  );

  // Exams by subject
  const examsBySubjectRaw = await Exam.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);
  const examsBySubject = examsBySubjectRaw.map((e: any) => ({
    subject: e._id,
    count: e.count,
  }));

  // Submissions per day last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dailyRaw = await Submission.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%m/%d', date: '$createdAt', timezone: 'Asia/Dhaka' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const submissionsPerDay = dailyRaw.map((d: any) => ({ date: d._id, count: d.count }));

  return NextResponse.json({
    totalTeachers, activeTeachers, totalExams, activeExams, endedExams,
    totalStudents, totalSubmissions, recentExams, examsBySubject, submissionsPerDay,
  });
}

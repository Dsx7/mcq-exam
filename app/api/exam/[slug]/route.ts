import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Branding from '@/models/Branding';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;

  const exam = await Exam.findOne({ slug })
    .populate({
      path: 'questions',
      select: '-correctAnswer -explanation', // HIDE correct answer from students
    })
    .lean();

  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

  // Get teacher branding
  const branding = await Branding.findOne({ ownerId: (exam as any).teacherId }).lean();

  return NextResponse.json({
    exam: {
      _id: (exam as any)._id.toString(),
      title: (exam as any).title,
      subject: (exam as any).subject,
      duration: (exam as any).duration,
      status: (exam as any).status,
      startedAt: (exam as any).startedAt,
      questions: ((exam as any).questions ?? []).map((q: any) => ({
        _id: q._id.toString(),
        text: q.text,
        options: q.options,
        marks: q.marks,
        subject: q.subject,
      })),
      branding: branding
        ? {
            instituteName: (branding as any).instituteName,
            logoUrl: (branding as any).logoUrl,
            headerText: (branding as any).headerText,
            footerText: (branding as any).footerText,
          }
        : null,
    },
  });
}

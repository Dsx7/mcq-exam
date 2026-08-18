import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Submission from '@/models/Submission';
import Question from '@/models/Question';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { id } = await params;
  const type = req.nextUrl.searchParams.get('type') ?? 'excel';

  const exam = await Exam.findOne({ _id: id, teacherId: session.user.id }).populate('questions').lean();
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const submissions = await Submission.find({ examId: id }).sort({ rank: 1 }).lean();

  const rows = submissions.map((s: any) => ({
    Rank: s.rank ?? '-',
    Roll: s.studentRoll,
    Name: s.studentName,
    Score: s.score,
    'Correct Answers': s.correct,
    'Wrong Answers': s.wrong,
    Unanswered: s.unanswered,
    Percentage: `${s.percentage}%`,
    'Time Taken': `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s`,
  }));

  const examTitle = (exam as any).title;
  const subject = (exam as any).subject;
  const endedAt = (exam as any).endedAt
    ? new Date((exam as any).endedAt).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })
    : '';

  if (type === 'excel') {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    // Add title row above
    XLSX.utils.sheet_add_aoa(ws, [[`Exam: ${examTitle}`], [`Subject: ${subject}`], [`Date: ${endedAt}`], ['']], { origin: 'A1' });
    XLSX.utils.sheet_add_json(ws, rows, { origin: 'A5' });

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="results-${id}.xlsx"`,
      },
    });
  }

  // PDF
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 80);
  doc.text(examTitle, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Subject: ${subject}`, 14, 28);
  doc.text(`Date: ${endedAt}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [['Rank', 'Roll', 'Name', 'Score', 'Correct', 'Wrong', 'Unanswered', '%', 'Time']],
    body: rows.map((r) => [
      r.Rank, r.Roll, r.Name, r.Score, r['Correct Answers'],
      r['Wrong Answers'], r.Unanswered, r.Percentage, r['Time Taken'],
    ]),
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [245, 240, 255] },
  });

  const pdfBuf = Buffer.from(doc.output('arraybuffer'));
  return new NextResponse(pdfBuf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="results-${id}.pdf"`,
    },
  });
}

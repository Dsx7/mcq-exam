import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Exam from '@/models/Exam';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 }).lean();
  const teachersWithCount = await Promise.all(
    teachers.map(async (t: any) => ({
      _id: t._id.toString(),
      name: t.name,
      email: t.email,
      isActive: t.isActive,
      createdAt: t.createdAt,
      examCount: await Exam.countDocuments({ teacherId: t._id }),
    }))
  );

  return NextResponse.json({ teachers: teachersWithCount });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const teacher = await User.create({ name, email, password: hashed, role: 'teacher', isActive: true });

  return NextResponse.json({ teacher: { _id: teacher._id.toString(), name: teacher.name, email: teacher.email } }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Seed admin on first run — POST /api/seed
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret');
  if (secret !== 'SEED_SECRET_MCQ_EXAM_2024') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const existingAdmin = await User.findOne({ email: 'admin@exam.com' });
  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    await User.create({
      name: 'System Admin',
      email: 'admin@exam.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });
  }

  const existingTeacher = await User.findOne({ email: 'teacher@exam.com' });
  if (!existingTeacher) {
    const teacherPassword = await bcrypt.hash('Teacher@1234', 12);
    await User.create({
      name: 'Demo Teacher',
      email: 'teacher@exam.com',
      password: teacherPassword,
      role: 'teacher',
      isActive: true,
    });
  }

  return NextResponse.json({ 
    message: 'Seeding complete', 
    accounts: {
      admin: 'admin@exam.com / Admin@1234',
      teacher: 'teacher@exam.com / Teacher@1234'
    }
  });
}

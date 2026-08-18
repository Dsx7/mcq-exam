import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Branding from '@/models/Branding';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const branding = await Branding.findOne({ ownerId: session.user.id, ownerRole: 'teacher' }).lean();
  return NextResponse.json({ branding: branding ?? null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const body = await req.json();
  await Branding.findOneAndUpdate(
    { ownerId: session.user.id },
    { ...body, ownerId: session.user.id, ownerRole: 'teacher' },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

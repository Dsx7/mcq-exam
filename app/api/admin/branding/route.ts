import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Branding from '@/models/Branding';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const branding = await Branding.findOne({ ownerRole: 'admin' }).lean();
  return NextResponse.json({ branding: branding ?? null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await connectDB();

  const body = await req.json();
  const adminId = session.user.id;

  await Branding.findOneAndUpdate(
    { ownerId: adminId },
    { ...body, ownerId: adminId, ownerRole: 'admin' },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

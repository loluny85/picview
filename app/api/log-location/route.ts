import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { photo, ipInfo, timezone, userAgent } = body;

  console.log('🚨 API hit: /api/log-photo');
  console.log('🧠 IP Info:', ipInfo);
  console.log('🕐 Timezone:', timezone);
  console.log('🧠 User-Agent:', userAgent);
  console.log('🖼️ Image received, length:', photo?.length || 0);

  return NextResponse.json({ status: 'logged' });
}

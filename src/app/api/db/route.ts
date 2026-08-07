export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { DB_DATA } from '@/data/dbData';

export async function GET() {
  return NextResponse.json({ data: { profile: { appName: "Okan" }, chains: [] } });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ success: true });
}





export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import DB_DATA from '@/data/dbData';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const ensureDir = () => {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const isValidDb = (data: any) => {
  return data && typeof data === 'object' && Boolean(data.profile);
};

export async function GET() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(rawData);
      if (isValidDb(parsed)) {
        return NextResponse.json({ data: parsed });
      }
    }
  } catch (e) {}

  return NextResponse.json({ data: DB_DATA }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (isValidDb(body)) {
      ensureDir();
      fs.writeFileSync(DB_PATH, JSON.stringify(body, null, 2), 'utf-8');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write local DB:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}




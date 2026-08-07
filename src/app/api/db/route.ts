export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import defaultData from '@/data/db.json';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const ensureDir = () => {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const isValidDb = (data: any) => {
  return data && typeof data === 'object' && (Boolean(data.profile) || Boolean(data.chains) || Boolean(data.documents));
};

const getDbData = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(rawData);
      if (isValidDb(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}

  const rawDefault = (defaultData as any)?.default || defaultData;
  if (isValidDb(rawDefault)) {
    return rawDefault;
  }
  return defaultData;
};

export async function GET() {
  const data = getDbData();
  return NextResponse.json({ data }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
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


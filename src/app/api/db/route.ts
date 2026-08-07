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

const extractDb = (input: any): any => {
  if (!input || typeof input !== 'object') return null;
  if (input.profile || input.chains || input.documents) return input;
  if (input.default && (input.default.profile || input.default.chains || input.default.documents)) return input.default;
  if (input.data && (input.data.profile || input.data.chains || input.data.documents)) return input.data;
  return null;
};

export async function GET() {
  let data = null;

  try {
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(rawData);
      data = extractDb(parsed);
    }
  } catch (e) {}

  if (!data) {
    data = extractDb(defaultData);
  }

  return NextResponse.json({ data }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clean = extractDb(body);
    if (clean) {
      ensureDir();
      fs.writeFileSync(DB_PATH, JSON.stringify(clean, null, 2), 'utf-8');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write local DB:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}



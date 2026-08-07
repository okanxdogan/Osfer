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

export async function GET() {
  try {
    ensureDir();
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(rawData);
      if (parsed && Object.keys(parsed).length > 0) {
        return NextResponse.json({ data: parsed });
      }
    }
    return NextResponse.json({ data: defaultData });
  } catch (error) {
    console.error('Failed to read local DB, returning static bundle data:', error);
    return NextResponse.json({ data: defaultData });
  }
}


export async function POST(req: NextRequest) {
  try {
    ensureDir();
    const body = await req.json();
    fs.writeFileSync(DB_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write local DB:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

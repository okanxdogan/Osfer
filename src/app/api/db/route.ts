import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    if (!fs.existsSync(DB_PATH)) {
      return NextResponse.json({ data: null });
    }
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    return NextResponse.json({ data: JSON.parse(rawData) });
  } catch (error) {
    console.error('Failed to read local DB:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
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

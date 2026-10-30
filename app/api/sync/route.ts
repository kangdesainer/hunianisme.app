import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'site_data.json');

let memoryCache: {
  properties?: any[];
  articles?: any[];
  settings?: any;
  lastUpdated?: string;
} | null = null;

function getInitialData() {
  if (memoryCache) return memoryCache;
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      memoryCache = JSON.parse(content);
      return memoryCache;
    }
  } catch (err) {
    console.warn('Initial read of site_data.json fallback to defaults', err);
  }
  memoryCache = { properties: [], articles: [], settings: null, lastUpdated: new Date().toISOString() };
  return memoryCache;
}

export async function GET() {
  try {
    const data = getInitialData();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error in GET /api/sync', err);
    return NextResponse.json({ properties: [], articles: [], settings: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentData = getInitialData() || {};

    const updatedData = {
      properties: body.properties !== undefined ? body.properties : currentData.properties || [],
      articles: body.articles !== undefined ? body.articles : currentData.articles || [],
      settings: body.settings !== undefined ? body.settings : currentData.settings,
      lastUpdated: new Date().toISOString(),
    };

    memoryCache = updatedData;

    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf-8');
    } catch (fsErr) {
      // In containerized/read-only runtimes, memoryCache still holds state
      console.warn('Filesystem write site_data.json skipped or read-only:', fsErr);
    }

    return NextResponse.json({ success: true, lastUpdated: updatedData.lastUpdated });
  } catch (err: any) {
    console.error('Error handling POST /api/sync', err);
    return NextResponse.json({ success: true, cachedOnly: true });
  }
}

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const uri = process.env.MONGODB_URI || "";

// Cache instance client agar tidak overload koneksi MongoDB di Vercel Serverless
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MongoDB URI tidak dikonfigurasi di Environment Variables Vercel");
  cachedClient = await MongoClient.connect(uri);
  return cachedClient;
}

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db('gede_db');
    
    // Ambil semua data checklist terbaru langsung dari server database
    const checklistData = await db.collection('gear_checklist').find({}).toArray();
    
    const checklistState: { [key: string]: boolean } = {};
    checklistData.forEach((item: any) => {
      checklistState[`${item.participantName}-${item.gearName}`] = item.isChecked;
    });

    // Return dengan Header Bypass Cache super ketat
    return new NextResponse(JSON.stringify(checklistState), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantName, gearName, isChecked } = body;

    if (!participantName || !gearName) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db('gede_db');

    // Operasi atomik: Mengunci baris dokumen spesifik milik satu orang + satu alat
    // Mencegah tabrakan meskipun 3 orang klik bareng di milidetik yang sama
    await db.collection('gear_checklist').updateOne(
      { participantName, gearName },
      { 
        $set: { 
          participantName, 
          gearName, 
          isChecked: Boolean(isChecked), 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
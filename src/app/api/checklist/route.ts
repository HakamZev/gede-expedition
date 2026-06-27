import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MongoDB URI tidak dikonfigurasi");
  cachedClient = await MongoClient.connect(uri);
  return cachedClient;
}

// GET: Mengambil semua data checklist milik semua orang
export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db('gede_db');
    
    const checklistData = await db.collection('gear_checklist').find({}).toArray();
    
    const checklistState: { [key: string]: boolean } = {};
    checklistData.forEach((item: any) => {
      checklistState[`${item.participantName}-${item.gearName}`] = item.isChecked;
    });

    return new NextResponse(JSON.stringify(checklistState), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Sinkronisasi data lokal dari HP pengguna ke cloud database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body; // Menerima array dari data yang diubah lokal

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Format data salah" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db('gede_db');
    const collection = db.collection('gear_checklist');

    // Lakukan bulk write atau looping update massal dengan aman
    for (const update of updates) {
      const { participantName, gearName, isChecked } = update;
      await collection.updateOne(
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
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
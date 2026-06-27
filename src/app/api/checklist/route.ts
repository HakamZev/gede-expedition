import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MONGODB_URI belum dikonfigurasi di Environment Variables");
  cachedClient = await MongoClient.connect(uri);
  return cachedClient;
}

// GET: Mengambil data untuk semua orang
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

// POST: Menyimpan massal dengan proteksi BulkWrite (Anti Gagal)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada data yang perlu diperbarui" });
    }

    const client = await connectToDatabase();
    const db = client.db('gede_db');
    const collection = db.collection('gear_checklist');

    // Susun operasi bulk agar MongoDB mengeksekusi semuanya dalam 1 perintah tunggal
    const operations = updates.map((update: any) => ({
      updateOne: {
        filter: { participantName: update.participantName, gearName: update.gearName },
        update: { 
          $set: { 
            participantName: update.participantName, 
            gearName: update.gearName, 
            isChecked: Boolean(update.isChecked), 
            updatedAt: new Date() 
          } 
        },
        upsert: true
      }
    }));

    // Jalankan operasi massal ke MongoDB
    const result = await collection.bulkWrite(operations);

    return NextResponse.json({ 
      success: true, 
      matchedCount: result.matchedCount, 
      upsertedCount: result.upsertedCount 
    });
  } catch (error: any) {
    console.error("Error bulkWrite MongoDB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
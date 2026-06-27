import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MEMAKSA VERCEL UNTUK SELALU MENGAMBIL DATA SEGAR DARI DATABASE (TANPA CACHE)
export const dynamic = 'force-dynamic';

const uri = process.env.MONGODB_URI || "";

export async function GET() {
  try {
    if (!uri) return NextResponse.json({ error: "MongoDB URI tidak dikonfigurasi" }, { status: 500 });
    
    const client = await MongoClient.connect(uri);
    const db = client.db('gede_db');
    
    // Ambil semua data checklist yang tersimpan
    const checklistData = await db.collection('gear_checklist').find({}).toArray();
    
    // Ubah format array menjadi objek key-value agar mudah dibaca di frontend
    const checklistState: { [key: string]: boolean } = {};
    checklistData.forEach((item: any) => {
      checklistState[`${item.participantName}-${item.gearName}`] = item.isChecked;
    });

    await client.close();
    return NextResponse.json(checklistState);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!uri) return NextResponse.json({ error: "MongoDB URI tidak dikonfigurasi" }, { status: 500 });
    const body = await request.json();
    const { participantName, gearName, isChecked } = body;

    const client = await MongoClient.connect(uri);
    const db = client.db('gede_db');

    // Gunakan upsert: jika data kombinasi orang & alat sudah ada maka diupdate, jika belum ada dibuat baru
    await db.collection('gear_checklist').updateOne(
      { participantName, gearName },
      { $set: { participantName, gearName, isChecked, updatedAt: new Date() } },
      { upsert: true }
    );

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
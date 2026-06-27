import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MONGODB_URI belum dikonfigurasi");
  cachedClient = await MongoClient.connect(uri);
  return cachedClient;
}

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db('gede_db');
    const checklistData = await db.collection('gear_checklist').find({}).toArray();
    
    const checklistState: { [key: string]: boolean } = {};
    checklistData.forEach((item: any) => {
      checklistState[`${item.participantName}-${item.gearName}`] = item.isChecked;
    });

    return NextResponse.json(checklistState);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Format data salah" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db('gede_db');
    const collection = db.collection('gear_checklist');

    for (const update of updates) {
      const { participantName, gearName, isChecked } = update;
      await collection.updateOne(
        { participantName, gearName },
        { $set: { participantName, gearName, isChecked: Boolean(isChecked), updatedAt: new Date() } },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
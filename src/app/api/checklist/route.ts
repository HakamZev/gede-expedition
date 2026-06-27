import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Model Skema Tunggal menggunakan jalur koneksi @/lib/db
const ChecklistSchema = new mongoose.Schema({
  participantName: { type: String, required: true },
  gearName: { type: String, required: true },
  isChecked: { type: Boolean, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'gear_checklists' });

const Checklist = mongoose.models.Checklist || mongoose.model('Checklist', ChecklistSchema);

// ========================================================
// METODE GET: AMBIL DATA DARI DATABASE (KEBAL CACHE)
// ========================================================
export async function GET() {
  try {
    await connectToDatabase();
    const checklistData = await Checklist.find({});
    
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

// ========================================================
// METODE POST: SIMPAN DATA DENGAN BULKWRITE (ANTI TABRAKAN)
// ========================================================
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada data" });
    }

    const bulkOperations = updates.map((update: any) => ({
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

    await Checklist.bulkWrite(bulkOperations);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
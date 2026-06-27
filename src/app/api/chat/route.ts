import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import { Expedition } from '../../../models/Expedition';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { sender, message } = await request.json();
    const doc = await Expedition.findOne();
    if (!doc) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    
    doc.chats.push({ sender, message, timestamp: new Date() });
    await doc.save();
    return NextResponse.json(doc.chats);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal' }, { status: 500 });
  }
}
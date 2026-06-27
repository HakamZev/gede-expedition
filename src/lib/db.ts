import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://hakam_db_user:xG79C.aHDehb45%23@cluster0.rmzycj4.mongodb.net/gede_db?retryWrites=true&w=majority";

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Memberikan tipe data Mongoose eksplisit pada callback .then()
    cached.promise = mongoose.connect(MONGODB_URI).then((m: typeof mongoose) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
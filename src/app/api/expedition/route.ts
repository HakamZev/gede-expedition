import { connectToDatabase } from "@/lib/db";
import { Expedition } from "@/models/Expedition";
import { NextResponse } from "next/server";

// ==========================================
// 1. METODE GET: AMBIL ATAU INISIALISASI DATA
// ==========================================
export async function GET() {
  try {
    await connectToDatabase();
    let data = await Expedition.findOne();
    
    if (!data) {
      data = await Expedition.create({
        trailName: 'Jalur Gunung Putri',
        summitElevation: '2.958 mdpl',
        basecampElevation: '± 1.618 mdpl',
        temperatures: '5°C - 18°C',
        participants: [
          { name: 'Hakam Aji Ramadhan', role: 'Project Officer' },
          { name: 'Maryam', role: 'P3K' },
          { name: 'Dita Cahya Anjani', role: 'Konsumsi' }
        ],
        gearTeam: [
          { category: 'Camp', name: 'Tenda 4 Orang', qty: '2 Unit', pic: 'Rio' }
        ],
        gearPersonal: [
          // Clothing
          { name: "👕 Hiking Outfit (1 Set) [Wajib]" },
          { name: "👕 Baju Ganti (2 Set) [Wajib]" },
          { name: "🧥 Jaket Hangat & Tebal [Wajib]" },
          { name: "🧤 Sarung Tangan [Opsional]" },
          { name: "🧢 Topi / Kupluk [Opsional]" },
          { name: "🎭 Masker / Buff [Opsional]" },
          // Footwear
          { name: "🥾 Sepatu Gunung Kuat [Wajib]" },
          { name: "🩴 Sandal Ringan [Wajib]" },
          // Backpack
          { name: "🎒 Tas Carrier Utama [Wajib]" },
          { name: "🌧️ Rain Cover Tas [Opsional]" },
          // Lighting
          { name: "🔦 Headlamp / Senter [Wajib]" },
          { name: "🔋 Baterai Cadangan [Opsional]" },
          // Weather Protection
          { name: "🧥 Jas Hujan (Rekomendasi Ponco/Batman) [Wajib]" },
          // Hydration and Nutrition
          { name: "💧 Air Minum (Pria 3L / Wanita 2.1L) [Wajib]" },
          { name: "🍫 Logistik Cemalan Tinggi Energi [Wajib]" },
          // Sleeping Essentials
          { name: "🛌 Sleeping Bag Hangat [Wajib]" },
          { name: "マット Matras Isolasi Tanah [Wajib]" },
          // Cooking and Eating
          { name: "🍽️ Alat Makan (Piring, Sendok, Garpu) [Wajib]" },
          // Personal Items
          { name: "🪪 Kartu Identitas / KTP Resmi [Wajib]" },
          { name: "🩹 Kotak P3K Pribadi & Obat Khusus [Wajib]" },
          { name: "🧼 Alat Mandi & Sikat Gigi [Wajib]" },
          { name: "🧴 Sunblock Tabir Surya [Opsional]" },
          { name: "💄 Lip Balm Anti Pecah [Opsional]" },
          // Miscellaneous
          { name: "🔋 Power Bank Charger [Opsional]" },
          { name: "🗑️ Kantong Plastik Sampah (Trash Bag) [Wajib]" },
          { name: "📓 Buku Catatan & Pena [Opsional]" },
          { name: "📢 Pluit Darurat [Wajib]" }
        ],
        schedules: [
          { day: 1, time: '06.00 – 07.30', duration: '90 mnt', activity: 'Tiba di Basecamp Gunung Putri', notes: 'Repacking logistik' }
        ]
      });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

// ==========================================
// 2. METODE PUT: SIMPAN PEMBARUAN KE MONGOO
// ==========================================
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Proteksi Inti: Buang properti metadata bawan MongoDB agar skema Mongoose tidak crash
    const { _id, createdAt, updatedAt, __v, ...dataToUpdate } = body;

    // Cari dokumen ekspedisi dan timpa dengan data roster / logistik kelompok yang baru
    const updated = await Expedition.findOneAndUpdate({}, dataToUpdate, { 
      new: true,           // Kembalikan objek versi terbaru setelah mutasi sukses
      runValidators: true  // Validasi ulang data input sesuai cetakan Schema Model
    });

    if (!updated) {
      return NextResponse.json({ error: 'Dokumen ekspedisi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("🔥 Error saat menyimpan pembaruan ke DB:", error.message || error);
    return NextResponse.json({ 
      error: 'Gagal memperbarui data', 
      detail: error.message 
    }, { status: 500 });
  }
}
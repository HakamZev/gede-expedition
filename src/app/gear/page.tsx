'use client';
import { useEffect, useState, useCallback } from 'react';

export default function GearChecklistTable() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({});
  
  // State pencatat editan lokal sebelum tombol simpan diklik
  const [localChanges, setLocalChanges] = useState<{ [key: string]: { participantName: string; gearName: string; isChecked: boolean } }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fungsi Fetching sinkronisasi database
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      
      // 1. Ambil data personil tim aktif
      const resExpedition = await fetch(`/api/expedition?t=${timestamp}`, { cache: 'no-store' });
      const dExpedition = await resExpedition.json();
      setData(dExpedition);

      // 2. Ambil data status checklist dari MongoDB
      const resChecklist = await fetch(`/api/checklist?t=${timestamp}`, { cache: 'no-store' });
      const dChecklist = await resChecklist.json();
      
      if (dChecklist && !dChecklist.error) {
        setChecklistState(dChecklist);
        setLocalChanges({}); // Reset paksa log perubahan lokal setelah sukses sinkron
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data cloud:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi Klik: Merubah tampilan visual secara instan di layar
  const toggleCheck = (participantName: string, gearName: string) => {
    const key = `${participantName}-${gearName}`;
    const targetStatus = !checklistState[key];

    // Mengunci posisi centang di layar agar tidak hilang/berkedip
    setChecklistState(prev => ({ ...prev, [key]: targetStatus }));

    // Masukkan ke dalam daftar antrean simpan
    setLocalChanges(prev => ({
      ...prev,
      [key]: { participantName, gearName, isChecked: targetStatus }
    }));
    setSaveSuccess(false);
  };

  // Fungsi Kirim Data ke MongoDB Cloud
  const handleSaveChanges = async () => {
    const updatesArray = Object.values(localChanges);
    if (updatesArray.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ updates: updatesArray })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setLocalChanges({});
        setSaveSuccess(true);
        // Paksa halaman menarik data paling baru untuk membuktikan data tersimpan permanen
        await fetchData(); 
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(`❌ Gagal Simpan: ${resData.error || 'Server error'}`);
        await fetchData(); // Kembalikan ke state awal database jika gagal
      }
    } catch (error: any) {
      alert(`💥 Terjadi gangguan jaringan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(localChanges).length > 0;

  if (loading && !data) return <div className="text-center p-12 text-slate-800 font-medium">Sinkronisasi Database Mongoose...</div>;
  if (!data) return <div className="text-center p-12 text-red-600 font-medium">Gagal memuat data ekspedisi.</div>;

  const gearCategories = [
    {
      category: "Clothing (Pakaian)",
      items: [
        { name: "Hiking Outfit (1 Set)", type: "Wajib" },
        { name: "Baju Ganti (2 Set)", type: "Wajib" },
        { name: "Jaket Hangat & Tebal", type: "Wajib" },
        { name: "Sarung Tangan", type: "Opsional" },
        { name: "Topi / Kupluk", type: "Opsional" },
        { name: "Kaos Kaki Banyak", type: "Opsional" },
        { name: "Masker / Buff", type: "Opsional" }
      ]
    },
    {
      category: "Footwear (Alas Kaki)",
      items: [
        { name: "Sepatu Gunung Kuat", type: "Wajib" },
        { name: "Sandal Ringan", type: "Wajib" }
      ]
    },
    {
      category: "Backpack (Tas)",
      items: [
        { name: "Tas Carrier Utama", type: "Wajib" },
        { name: "Rain Cover Tas", type: "Opsional" }
      ]
    },
    {
      category: "Lighting (Penerangan)",
      items: [
        { name: "Headlamp / Senter", type: "Wajib" },
        { name: "Baterai Cadangan", type: "Opsional" }
      ]
    },
    {
      category: "Weather Protection (Proteksi Cuaca)",
      items: [
        { name: "Jas Hujan (Ponco/Batman)", type: "Wajib" }
      ]
    },
    {
      category: "Hydration and Nutrition (Cairan & Nutrisi)",
      items: [
        { name: "Air Minum (Pria 3L / Wanita 2.1L)", type: "Wajib" },
        { name: "Logistik Cemilan Tinggi Energi", type: "Wajib" }
      ]
    },
    {
      category: "Sleeping Essentials (Perlengkapan Tidur)",
      items: [
        { name: "Sleeping Bag Hangat", type: "Wajib" },
        { name: "Matras Isolasi Tanah", type: "Wajib" }
      ]
    },
    {
      category: "Cooking and Eating (Alat Makan)",
      items: [
        { name: "Alat Makan (Piring, Sendok, Garpu)", type: "Wajib" },
        { name: "Pisau", type: "Wajib" },
        { name: "Korek", type: "Wajib" },
        { name: "Gelas", type: "Wajib" }
      ]
    },
    {
      category: "Personal Items (Barang Pribadi)",
      items: [
        { name: "Kartu Identitas / KTP Resmi", type: "Wajib" },
        { name: "Kotak P3K Pribadi & Obat Khusus", type: "Wajib" },
        { name: "Alat Mandi & Sikat Gigi", type: "Wajib" },
        { name: "Sunblock Tabir Surya", type: "Opsional" },
        { name: "Lip Balm Anti Pecah", type: "Opsional" }
      ]
    },
    {
      category: "Miscellaneous (Lain-lain)",
      items: [
        { name: "Power Bank Charger", type: "Opsional" },
        { name: "Tracking Pole", type: "Opsional" },
        { name: "Kantong Plastik Sampah (Trash Bag)", type: "Wajib" },
        { name: "Buku Catatan & Pena", type: "Opsional" },
        { name: "Pluit Darurat", type: "Wajib" }
      ]
    }
  ];

  const totalParticipants = data.participants.length;
  const gridTemplateStyle = {
    gridTemplateColumns: `300px 100px repeat(${totalParticipants}, 140px)`
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER CONTROL PANEL */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 md:relative z-50">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
            <i className="fa-solid fa-cloud-arrow-up text-emerald-600 mr-2"></i>Matriks Checklist Perlengkapan Personal Tim
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Centang bawaan mandiri kamu, lalu tekan <strong className="text-emerald-700">Simpan Perubahan</strong> agar sinkron secara permanen.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={fetchData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold p-3 rounded-xl border border-slate-300 transition-colors"
            title="Tarik data terbaru dari cloud"
          >
            <i className="fa-solid fa-rotate"></i>
          </button>

          <button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`flex-grow md:flex-grow-0 inline-flex items-center justify-center text-xs font-black py-3 px-5 rounded-xl transition-all gap-2 shadow-sm ${
              hasChanges 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold' 
                : saveSuccess 
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <i className={`fa-solid ${isSaving ? 'fa-spinner animate-spin' : saveSuccess ? 'fa-circle-check' : 'fa-floppy-disk'}`}></i>
            {isSaving ? 'Sedang Menyimpan...' : saveSuccess ? 'Berhasil Disimpan!' : hasChanges ? `Simpan Perubahan (${Object.keys(localChanges).length})` : 'Sudah Sinkron'}
          </button>
        </div>
      </div>

      {/* 1. LAYOUT MOBILE HP */}
      <div className="block sm:hidden space-y-6">
        {gearCategories.map((cat, catIdx) => (
          <div key={`mobile-cat-${catIdx}`} className="space-y-3">
            <div className="bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-lg">
              📂 {cat.category}
            </div>

            {cat.items.map((item, itemIdx) => (
              <div key={`mobile-item-${catIdx}-${itemIdx}`} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h4>
                  {item.type === "Wajib" ? (
                    <span className="text-[8px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">WAJIB</span>
                  ) : (
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">OMISI</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
                  {data.participants.map((p: any, pIdx: number) => {
                    const isChecked = !!checklistState[`${p.name}-${item.name}`];
                    return (
                      <div 
                        key={pIdx}
                        onClick={() => toggleCheck(p.name, item.name)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs select-none cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-bold' 
                            : 'bg-slate-50/50 border-slate-100 text-slate-600 font-medium'
                        }`}
                      >
                        <span className="truncate pr-1">👤 {p.name.split(' ')[0]}</span>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {}} 
                          className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded accent-emerald-600"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 2. LAYOUT DESKTOP */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="overflow-auto max-h-[calc(100vh-220px)] min-w-full">
          <div style={{ minWidth: `${400 + (totalParticipants * 140)}px` }} className="text-left">
            
            <div style={gridTemplateStyle} className="grid bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-bold sticky top-0 z-30 items-center">
              <div className="p-4 sticky left-0 bg-slate-50 z-40 border-r border-slate-200 h-full flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Nama Perlengkapan / Alat
              </div>
              <div className="p-4 text-center border-r border-slate-200 h-full flex items-center justify-center">
                Sifat
              </div>
              {data.participants.map((p: any, idx: number) => (
                <div key={idx} className="p-4 text-center text-sm font-black text-slate-900 bg-emerald-50/90 h-full flex items-center justify-center border-r border-slate-100">
                  👤 {p.name.split(' ')[0]}
                </div>
              ))}
            </div>

            <div className="text-sm text-slate-800 font-medium divide-y divide-slate-100">
              {gearCategories.map((cat, catIdx) => (
                <div key={`desktop-cat-group-${catIdx}`}>
                  <div className="w-full bg-slate-100/90 border-y border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider p-3 pl-4 sticky top-[48px] z-20">
                    📂 {cat.category}
                  </div>

                  {cat.items.map((item, itemIdx) => (
                    <div key={`desktop-item-${catIdx}-${itemIdx}`} style={gridTemplateStyle} className="grid hover:bg-slate-50/60 border-b border-slate-100 items-center">
                      <div className="p-3 pl-6 font-semibold text-slate-900 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate h-full flex items-center">
                        {item.name}
                      </div>
                      <div className="p-3 text-center border-r border-slate-100 bg-white h-full flex items-center justify-center">
                        {item.type === "Wajib" ? (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">WAJIB</span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">OMISI</span>
                        )}
                      </div>

                      {data.participants.map((p: any, pIdx: number) => {
                        const isChecked = !!checklistState[`${p.name}-${item.name}`];
                        return (
                          <div key={pIdx} onClick={() => toggleCheck(p.name, item.name)} className={`p-3 text-center cursor-pointer select-none h-full flex items-center justify-center border-r border-slate-100 ${isChecked ? 'bg-emerald-50/40' : ''}`}>
                            <input type="checkbox" checked={isChecked} onChange={() => {}} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600 transform scale-110" />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
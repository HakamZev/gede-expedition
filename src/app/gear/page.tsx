'use client';
import { useEffect, useState } from 'react';

export default function GearChecklistTable() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // State checklist sekarang diisi dari database
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil data roster tim asli
      const resExpedition = await fetch('/api/expedition');
      const dExpedition = await resExpedition.json();
      setData(dExpedition);

      // 2. Ambil data checklist dari MongoDB Database
      const resChecklist = await fetch('/api/checklist');
      const dChecklist = await resChecklist.json();
      if (!dChecklist.error) {
        setChecklistState(dChecklist);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi toggle yang langsung menyimpan ke MongoDB
  const toggleCheck = async (participantName: string, gearName: string) => {
    const key = `${participantName}-${gearName}`;
    const targetStatus = !checklistState[key];

    // Optimistic Update: Ubah di layar secara instan dulu agar terasa cepat
    setChecklistState(prev => ({ ...prev, [key]: targetStatus }));

    try {
      // Kirim perubahan status centang ke database backend
      await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName,
          gearName,
          isChecked: targetStatus
        })
      });
    } catch (err) {
      console.error("Gagal menyimpan ke database:", err);
      // Revert/kembalikan jika gagal kirim ke server
      setChecklistState(prev => ({ ...prev, [key]: !targetStatus }));
    }
  };

  if (loading && !data) return <div className="text-center p-12 text-slate-800 font-medium">Memuat Matriks Perlengkapan...</div>;
  if (!data) return <div className="text-center p-12 text-red-600 font-medium">Gagal memuat data ekspedisi.</div>;

  // DATA KATEGORI (Tetap sama seperti kode sebelumnya)
  const gearCategories = [
    {
      category: "Clothing (Pakaian)",
      items: [
        { name: "Hiking Outfit (1 Set)", type: "Wajib" },
        { name: "Baju Ganti (2 Set)", type: "Wajib" },
        { name: "Jaket Hangat & Tebal", type: "Wajib" },
        { name: "Sarung Tangan", type: "Opsional" },
        { name: "Topi / Kupluk", type: "Opsional" },
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
        { name: "Alat Makan (Piring, Sendok, Garpu)", type: "Wajib" }
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
      
      {/* Header Panel */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
            <i className="fa-solid fa-table-list text-emerald-600 mr-2"></i>Matriks Checklist Perlengkapan Personal
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Centang nama masing-masing peserta untuk menandai kesiapan logistik mandiri mereka. data tersimpan otomatis di cloud database.
          </p>
        </div>
        
        <button 
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-300 transition-colors shrink-0 gap-1.5 w-full md:w-auto"
        >
          <i className={`fa-solid fa-rotate ${loading ? 'animate-spin text-emerald-600' : ''}`}></i>
          {loading ? 'Menyinkronkan...' : 'Refresh Data Roster Tim'}
        </button>
      </div>

      {/* 1. TAMPILAN MOBILE RESPONSIF */}
      <div className="block sm:hidden space-y-6">
        {gearCategories.map((cat, catIdx) => (
          <div key={`mobile-cat-${catIdx}`} className="space-y-3">
            <div className="bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-lg flex items-center shadow-xs">
              📂 {cat.category}
            </div>

            {cat.items.map((item, itemIdx) => (
              <div key={`mobile-item-${catIdx}-${itemIdx}`} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h4>
                  {item.type === "Wajib" ? (
                    <span className="text-[8px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 shrink-0">WAJIB</span>
                  ) : (
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">OMISI</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
                  {data.participants.map((p: any, pIdx: number) => {
                    const isChecked = checklistState[`${p.name}-${item.name}`];
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
                          checked={isChecked || false}
                          onChange={() => {}} 
                          className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 shrink-0"
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

      {/* 2. TAMPILAN DESKTOP */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="overflow-auto max-h-[calc(100vh-220px)] min-w-full">
          <div style={{ minWidth: `${400 + (totalParticipants * 140)}px` }} className="text-left">
            
            <div style={gridTemplateStyle} className="grid bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-bold sticky top-0 z-30 shadow-xs items-center">
              <div className="p-4 sticky left-0 bg-slate-50 z-40 border-r border-slate-200 h-full flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Nama Perlengkapan / Alat
              </div>
              <div className="p-4 text-center border-r border-slate-200 h-full flex items-center justify-center">
                Sifat
              </div>
              {data.participants.map((p: any, idx: number) => (
                <div key={idx} className="p-4 text-center text-sm font-black text-slate-900 bg-emerald-50/90 h-full flex items-center justify-center border-r border-slate-100 last:border-r-0">
                  👤 {p.name.split(' ')[0]}
                </div>
              ))}
            </div>

            <div className="text-sm text-slate-800 font-medium divide-y divide-slate-100">
              {gearCategories.map((cat, catIdx) => (
                <div key={`desktop-cat-group-${catIdx}`}>
                  <div className="w-full bg-slate-100/90 border-y border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider p-3 pl-4 sticky top-[48px] z-20 backdrop-blur-xs">
                    📂 {cat.category}
                  </div>

                  {cat.items.map((item, itemIdx) => (
                    <div key={`desktop-item-${catIdx}-${itemIdx}`} style={gridTemplateStyle} className="grid hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0 items-center">
                      <div className="p-3 pl-6 font-semibold text-slate-900 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate h-full flex items-center">
                        {item.name}
                      </div>
                      <div className="p-3 text-center border-r border-slate-100 bg-white h-full flex items-center justify-center">
                        {item.type === "Wajib" ? (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 tracking-wide">WAJIB</span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide">OMISI</span>
                        )}
                      </div>

                      {data.participants.map((p: any, pIdx: number) => {
                        const isChecked = checklistState[`${p.name}-${item.name}`];
                        return (
                          <div key={pIdx} onClick={() => toggleCheck(p.name, item.name)} className={`p-3 text-center cursor-pointer transition-colors select-none h-full flex items-center justify-center border-r border-slate-100 last:border-r-0 ${isChecked ? 'bg-emerald-50/40' : ''}`}>
                            <input type="checkbox" checked={isChecked || false} onChange={() => {}} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600 transform scale-110 shadow-2xs" />
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
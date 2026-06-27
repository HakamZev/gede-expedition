'use client';
import { useEffect, useState } from 'react';

export default function GearChecklistTable() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({});

  const fetchData = () => {
    setLoading(true);
    fetch('/api/expedition')
      .then(res => res.json())
      .then(d => {
        setData(d);
        const saved = localStorage.getItem('gede_gear_checklist');
        if (saved) setChecklistState(JSON.parse(saved));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCheck = (participantName: string, gearName: string) => {
    const key = `${participantName}-${gearName}`;
    const newState = { ...checklistState, [key]: !checklistState[key] };
    setChecklistState(newState);
    localStorage.setItem('gede_gear_checklist', JSON.stringify(newState));
  };

  if (loading && !data) return <div className="text-center p-12 text-slate-800 font-medium">Memuat Matriks Perlengkapan...</div>;
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

  // Rumus Menghitung Pembagian Grid Layout Secara Statis dan Konsisten
  // Kolom 1 (Nama Alat): 300px, Kolom 2 (Sifat): 100px, Sisa Kolom Orang: masing-masing 140px
  const gridTemplateStyle = {
    gridTemplateColumns: `300px 100px repeat(${totalParticipants}, 140px)`
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <i className="fa-solid fa-table-list text-emerald-600 mr-2"></i>Matriks Checklist Perlengkapan Personal Tim
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Centang pada kolom nama masing-masing peserta untuk menandai kesiapan logistik mereka.
          </p>
        </div>
        
        <button 
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl border border-slate-300 transition-colors shrink-0 gap-1.5"
        >
          <i className={`fa-solid fa-rotate ${loading ? 'animate-spin text-emerald-600' : ''}`}></i>
          {loading ? 'Menyinkronkan...' : 'Refresh Data Roster Tim'}
        </button>
      </div>

      {/* Kontainer Utama Matriks Flex/Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="overflow-auto max-h-[calc(100vh-220px)] min-w-full">
          
          {/* Pembungkus Grid dengan Lebar Minimum agar Scrollbar Muncul Lebih Cepat */}
          <div style={{ minWidth: `${400 + (totalParticipants * 140)}px` }} className="text-left">
            
            {/* 1. HEADER ROW (STICKY TOP) */}
            <div 
              style={gridTemplateStyle} 
              className="grid bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-bold sticky top-0 z-30 shadow-xs items-center"
            >
              <div className="p-4 sticky left-0 bg-slate-50 z-40 border-r border-slate-200 h-full flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Nama Perlengkapan / Alat
              </div>
              <div className="p-4 text-center border-r border-slate-200 h-full flex items-center justify-center">
                Sifat
              </div>
              {data.participants.map((p: any, idx: number) => (
                <div key={idx} className="p-4 text-center text-sm font-black text-slate-900 bg-emerald-50/90 h-full flex items-center justify-center border-r border-slate-100 last:border-r-0 backdrop-blur-xs">
                  👤 {p.name.split(' ')[0]}
                </div>
              ))}
            </div>

            {/* 2. BODY BROWSING ROWS */}
            <div className="text-sm text-slate-800 font-medium divide-y divide-slate-100">
              {gearCategories.map((cat, catIdx) => (
                <div key={`cat-group-${catIdx}`}>
                  
                  {/* BARIS KATEGORI BESAR (STICKY SUB-HEADER) */}
                  {/* Dilepas dari gridTemplateStyle agar tidak mengacaukan keselarasan kolom di bawahnya */}
                  <div className="w-full bg-slate-100/90 border-y border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider p-3 pl-4 sticky top-[48px] z-20 backdrop-blur-xs">
                    📂 {cat.category}
                  </div>

                  {/* LOOP DAFTAR PERLENGKAPAN ALAT */}
                  {cat.items.map((item, itemIdx) => (
                    <div 
                      key={`item-${catIdx}-${itemIdx}`} 
                      style={gridTemplateStyle}
                      className="grid hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0 items-center"
                    >
                      {/* Nama Perlengkapan (STICKY LEFT) */}
                      <div className="p-3 pl-6 font-semibold text-slate-900 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate h-full flex items-center">
                        {item.name}
                      </div>
                      
                      {/* Sifat Atribut Badge */}
                      <div className="p-3 text-center border-r border-slate-100 bg-white h-full flex items-center justify-center">
                        {item.type === "Wajib" ? (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 tracking-wide">WAJIB</span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide">OMISI</span>
                        )}
                      </div>

                      {/* Kotak Kontrol Checkbox Setiap Peserta */}
                      {data.participants.map((p: any, pIdx: number) => {
                        const isChecked = checklistState[`${p.name}-${item.name}`];
                        return (
                          <div 
                            key={pIdx} 
                            onClick={() => toggleCheck(p.name, item.name)}
                            className={`p-3 text-center cursor-pointer transition-colors select-none h-full flex items-center justify-center border-r border-slate-100 last:border-r-0 ${
                              isChecked ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked || false}
                              onChange={() => {}} 
                              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600 transform scale-110 shadow-2xs"
                            />
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
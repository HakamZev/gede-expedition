'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

export default function GearChecklistTable() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({});
  
  // Antrean lokal yang kebal terhadap kegagalan jaringan
  const pendingSyncRef = useRef<{ [key: string]: { participantName: string; gearName: string; isChecked: boolean } }>({});
  const [pendingCount, setPendingCount] = useState(0);

  // 1. Ambil Data Gabungan (Cloud Database + Backup Lokal)
  const fetchData = useCallback(async (showFullLoading = true) => {
    if (showFullLoading) setLoading(true);
    try {
      const timestamp = new Date().getTime();
      
      const resExpedition = await fetch(`/api/expedition?t=${timestamp}`, { cache: 'no-store' });
      const dExpedition = await resExpedition.json();
      setData(dExpedition);

      const resChecklist = await fetch(`/api/checklist?t=${timestamp}`, { cache: 'no-store' });
      const dChecklist = await resChecklist.json();
      
      if (dChecklist && !dChecklist.error) {
        // Ambil cadangan lokal untuk memastikan tidak ada data yang terlewat
        const localSaved = localStorage.getItem('gede_gear_checklist_backup');
        const localParsed = localSaved ? JSON.parse(localSaved) : {};
        
        setChecklistState({ ...dChecklist, ...localParsed });
      }
    } catch (err) {
      console.error("Gagal menarik data cloud:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fungsi Sinkronisasi Latar Belakang yang Dilindungi (Safe Sync)
  const syncPendingToCloud = useCallback(async () => {
    // Ambil cuplikan antrean saat ini
    const currentQueue = { ...pendingSyncRef.current };
    const queueArray = Object.values(currentQueue);
    
    if (queueArray.length === 0) return;

    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ updates: queueArray })
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          // JIKA BERHASIL: Hapus HANYA data yang sukses dikirim dari antrean utama
          Object.keys(currentQueue).forEach(key => {
            if (pendingSyncRef.current[key] && pendingSyncRef.current[key].isChecked === currentQueue[key].isChecked) {
              delete pendingSyncRef.current[key];
            }
          });
          
          // Perbarui indikator angka antrean di layar
          const remainingCount = Object.keys(pendingSyncRef.current).length;
          setPendingCount(remainingCount);

          if (remainingCount === 0) {
            localStorage.removeItem('gede_gear_checklist_backup');
          }
        }
      }
    } catch (error) {
      console.error("Koneksi gagal, menyimpan antrean untuk dicoba 5 detik lagi:", error);
    }
  }, []);

  // Manajemen Polling Otomatis (Setiap 5 Detik)
  useEffect(() => {
    fetchData(true);
    
    const interval = setInterval(() => {
      syncPendingToCloud();
      fetchData(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchData, syncPendingToCloud]);

  // 3. Fungsi Klik Handler (0-Delay Responsif)
  const toggleCheck = (participantName: string, gearName: string) => {
    const key = `${participantName}-${gearName}`;
    const targetStatus = !checklistState[key];

    // A. Deteksi Instan di Layar Browser
    const updatedState = { ...checklistState, [key]: targetStatus };
    setChecklistState(updatedState);

    // B. Tulis ke Backup LocalStorage
    const localSaved = localStorage.getItem('gede_gear_checklist_backup');
    const localParsed = localSaved ? JSON.parse(localSaved) : {};
    localParsed[key] = targetStatus;
    localStorage.setItem('gede_gear_checklist_backup', JSON.stringify(localParsed));

    // C. Masukkan ke Ref Antrean untuk disemburkan ke MongoDB
    pendingSyncRef.current[key] = {
      participantName,
      gearName,
      isChecked: targetStatus
    };
    
    setPendingCount(Object.keys(pendingSyncRef.current).length);
  };

  if (loading && !data) return <div className="text-center p-12 text-slate-800 font-medium">Menghubungkan Jaringan Sinkronisasi...</div>;
  if (!data) return <div className="text-center p-12 text-red-600 font-medium">Gagal memuat data ekspedisi.</div>;

  // Master Kategori Alat (Tetap Sama)
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
            <i className="fa-solid fa-cloud-bolt text-emerald-600 mr-2"></i>Matriks Checklist (Local-First Sync V2)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Klik tersimpan instan di HP kamu dan otomatis dicicil ke database awan secara berkala.
          </p>
        </div>
        
        <div className="text-xs font-bold flex items-center gap-2 bg-slate-50 border px-4 py-2 rounded-xl shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full ${pendingCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          {pendingCount > 0 ? `Menyinkronkan ${pendingCount} data ke cloud...` : 'Cloud Terkoneksi & Sinkron'}
        </div>
      </div>

      {/* 1. TAMPILAN MOBILE HP */}
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
                          className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded accent-emerald-600 shadow-xs"
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
                            <input type="checkbox" checked={isChecked} onChange={() => {}} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600 transform scale-110 shadow-xs" />
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
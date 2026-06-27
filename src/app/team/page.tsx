'use client';
import { useEffect, useState } from 'react';

export default function TeamManagement() {
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  
  const [cat, setCat] = useState('Camp');
  const [gearName, setGearName] = useState('');
  const [qty, setQty] = useState('');
  const [pic, setPic] = useState('');

  useEffect(() => {
    fetch('/api/expedition')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  const updateDatabase = async (newData: any) => {
    setData(newData);
    await fetch('/api/expedition', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
  };

 const addParticipant = async () => {
    if (!name.trim() || !role.trim()) return;
    
    // Pastikan array participants sudah ada, jika belum buat array kosong
    const currentParticipants = data.participants || [];
    
    // Susun data partisipan baru
    const newParticipant = { name: name.trim(), role: role.trim() };
    const updatedParticipants = [...currentParticipants, newParticipant];
    
    // Kirim data utuh yang baru ke MongoDB Atlas melalui API PUT
    await updateDatabase({ 
      ...data, 
      participants: updatedParticipants 
    });
    
    // Kosongkan form input setelah berhasil menyimpan
    setName('');
    setRole('');
  };

  const deleteParticipant = async (idx: number) => {
    const updatedParticipants = data.participants.filter((_: any, i: number) => i !== idx);
    
    // Kirim pembaruan setelah data dihapus ke MongoDB Atlas
    await updateDatabase({ 
      ...data, 
      participants: updatedParticipants 
    });
  };

  const addGear = async () => {
    if (!gearName.trim() || !qty.trim() || !pic.trim()) return;

    // Pastikan array gearTeam sudah ada di database, jika belum buat array kosong
    const currentGear = data.gearTeam || [];

    // Susun data perlengkapan kelompok baru
    const newGear = { 
      category: cat, 
      name: gearName.trim(), 
      qty: qty.trim(), 
      pic: pic.trim() 
    };
    const updatedGear = [...currentGear, newGear];

    // Kirim data terupdate secara permanen ke MongoDB Atlas via API PUT
    await updateDatabase({ 
      ...data, 
      gearTeam: updatedGear 
    });

    // Bersihkan form input setelah sukses menyimpan ke database
    setGearName('');
    setQty('');
    setPic('');
  };

  const deleteGear = async (idx: number) => {
    const updatedGear = data.gearTeam.filter((_: any, i: number) => i !== idx);

    // Kirim perintah hapus permanen ke MongoDB Atlas
    await updateDatabase({ 
      ...data, 
      gearTeam: updatedGear 
    });
  };

  
  if (!data) return <div className="text-center p-12 text-slate-800 font-medium">Memuat Data Manajemen Tim...</div>;

  return (
    <div className="space-y-10 p-4 max-w-7xl mx-auto">
      
      {/* SECTION 1: ROSTER ANGGOTA TIM */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
          <i className="fa-solid fa-users text-emerald-600 mr-2"></i>Roster Anggota Tim
        </h2>
        
        {/* Form Tambah Peserta */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nama Anggota</label>
            <input 
              type="text" 
              placeholder="Contoh: Hakam Aji" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Jobdesk / Role</label>
            <input 
              type="text" 
              placeholder="Contoh: Navigator" 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium shadow-2xs"
            />
          </div>
          <button 
            onClick={addParticipant}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
          >
            + Tambah Anggota
          </button>
        </div>

        {/* List Grid Card Peserta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.participants.map((p: any, idx: number) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 text-base">{p.name}</p>
                <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm inline-block">{p.role}</p>
              </div>
              <button 
                onClick={() => deleteParticipant(idx)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Hapus Anggota"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PERLENGKAPAN KELOMPOK */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
          <i className="fa-solid fa-boxes-stacked text-emerald-600 mr-2"></i>Perlengkapan Kelompok (TIM)
        </h2>

        {/* Form Tambah Alat */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
            <select 
              value={cat} 
              onChange={e => setCat(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 font-semibold shadow-2xs"
            >
              <option value="Camp">Camp / Tenda</option>
              <option value="Masak">Dapur / Masak</option>
              <option value="Medis">P3K / Medis</option>
              <option value="Logistik">Bahan Makanan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nama Alat</label>
            <input 
              type="text" 
              placeholder="Contoh: Kompor Portable" 
              value={gearName} 
              onChange={e => setGearName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Qty</label>
            <input 
              type="text" 
              placeholder="Contoh: 2 Unit" 
              value={qty} 
              onChange={e => setQty(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">PIC (Penanggung Jawab)</label>
            <input 
              type="text" 
              placeholder="Contoh: Maryam" 
              value={pic} 
              onChange={e => setPic(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium shadow-2xs"
            />
          </div>
          <button 
            onClick={addGear}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
          >
            + Tambah Alat
          </button>
        </div>

        {/* Tabel Perlengkapan */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold tracking-wider">
                <th className="p-4">Kategori</th>
                <th className="p-4">Nama Alat Logistik</th>
                <th className="p-4">Jumlah (Qty)</th>
                <th className="p-4">PIC Lapangan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800 font-medium">
              {data.gearTeam.map((g: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">{g.category}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{g.name}</td>
                  <td className="p-4 text-slate-600">{g.qty}</td>
                  <td className="p-4 text-emerald-700 font-semibold">{g.pic}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteGear(idx)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
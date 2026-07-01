'use client';
import { useEffect, useState } from 'react';

export default function SchedulePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/expedition')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Tautan Koordinat Lokasi Rumah Hakam (Titik Kumpul)
  const meetingPointUrl = "http://maps.google.com/?q=-6.597628,106.799568";

  // Susunan Itinerary Resmi Gunung Gede via Putri (Jum'at - Minggu)
  const itinerary = [
    {
      day: "Jum'at, 3 Juli",
      events: [
        { 
          time: "15.00 - 19.00", 
          activity: "Kumpul di Rumah Hakam (Bogor)", 
          notes: "Batas waktu kedatangan maksimal pukul 19.00 WIB malam. Melakukan repacking logistik kelompok, pembagian beban carrier, dan makan malam bersama." 
        },
        { 
          time: "19.00 - 21.00", 
          activity: "Briefing Akhir & Istirahat Sejenak", 
          notes: "Briefing pembagian tugas jalur dan memastikan seluruh perlengkapan wajib (Personal Gear) sudah lengkap." 
        },
        { 
          time: "21.00 - 23.30", 
          activity: "Otw Perjalanan menuju Basecamp Gunung Putri", 
          notes: "Pemberangkatan serentak dari Rumah Hakam menggunakan transportasi tim menuju jalur Putri, Cipanas." 
        },
        { 
          time: "23.30 - Selesai", 
          activity: "Tiba di Basecamp & Istirahat Malam", 
          notes: "Cek in simaksi dan wajib langsung istirahat/tidur di basecamp untuk menghemat tenaga sebelum pendakian esok pagi." 
        }
      ]
    },
    {
      day: "Sabtu, 4 Juli",
      events: [
        { 
          time: "05.00 - 06.30", 
          activity: "Bangun Pagi, Bersih-bersih & Sarapan", 
          notes: "Wajib sarapan porsi cukup untuk modal energi utama pendakian. Peregangan otot bersama." 
        },
        { 
          time: "06.30 - 11.30", 
          activity: "Mulai Jalan Pendakian: Basecamp menuju Pos 2", 
          notes: "Mulai melangkah melewati ladang warga dan trek tanah menanjak konstan. Istirahat sejenak di Pos 1." 
        },
        { time: "11.30 - 12.30", activity: "Istirahat Makan Siang di Pos 2 (Buntut Lutung)", notes: "Pengisian energi, makan siang berat/ringan logistik kelompok, dan pembagian air." },
        { time: "12.30 - 15.30", activity: "Pendakian Terjal: Pos 2 menuju Alun-Alun Suryakencana", notes: "Melewati Pos 3 (Simpang Maleber) dan trek akar/batu terjal (Tanjakan Setan). Tetap jaga formasi barisan tim." },
        { time: "15.30 - 17.00", activity: "Tiba di Alun-Alun Suryakencana & Camp Building", notes: "Mendirikan tenda bersama di area savana bagian timur/barat, mengambil air di mata air Surken." },
        { time: "17.00 - 20.00", activity: "Masak Malam & Briefing Summit", notes: "Makan malam hangat bersama (PIC Konsumsi) dan koordinasi jam bangun untuk summit attack esok subuh." },
        { time: "20.00 - selesai", activity: "Istirahat / Tidur Malam", notes: "Wajib menggunakan sleeping bag dan pakaian hangat berlapis karena suhu Surken bisa drop hingga 5°C." }
      ]
    },
    {
      day: "Minggu, 5 Juli",
      events: [
        { time: "04.30 - 05.15", activity: "Bangun Pagi & Persiapan Summit", notes: "Minum teh/kopi hangat hangat dan membawa headlamp serta jaket." },
        { time: "05.15 - 06.00", activity: "Summit Attack menuju Puncak Gunung Gede", notes: "Pendakian singkat namun terjal melewati batas vegetasi menuju puncak (2.958 mdpl)." },
        { time: "06.00 - 08.00", activity: "Enjoy Puncak Gede & Dokumentasi", notes: "Menikmati matahari terbit (sunrise), melihat kawah aktif, dan foto bersama seluruh tim." },
        { time: "08.00 - 08.45", activity: "Turun kembali ke Camp Suryakencana", notes: "Perjalanan turun santai kembali ke area tenda." },
        { time: "08.45 - 11.00", activity: "Sarapan Pagi & Packing Barang (Operasi Bersih)", notes: "Makan pagi bersama, merobohkan tenda, dan mengumpulkan seluruh sampah ke dalam Trash Bag." },
        { time: "11.00 - 15.00", activity: "Perjalanan Turun menuju Basecamp Putri", notes: "Turun melewati jalur yang sama. Hati-hati pada lutut dan tumpuan kaki." },
        { time: "15.00 - 16.30", activity: "Tiba di Basecamp, Bersih-bersih & Istirahat", notes: "Mandi, laporan penutupan simaksi, dan makan sore di basecamp." },
        { time: "16.30 - selesai", activity: "Perjalanan Pulang Kembali ke Bogor", notes: "Ekspedisi selesai. Kembali ke Bogor (Drop off di Rumah Hakam / Stasiun Bogor) dengan selamat!" }
      ]
    }
  ];

  // Fungsi Pembuatan URL Google Calendar Terbaru (Mulai Jum'at 3 Juli Jam 17.00)
  const generateGoogleCalendarUrl = () => {
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const title = encodeURIComponent("Ekspedisi Gunung Gede via Putri 2026");
    
    // Rentang Event: Jum'at 3 Juli 2026 jam 17.00 WIB s/d Minggu 5 Juli 2026 jam 20.00 WIB
    const dates = "20260703T170000/20260705T200000"; 
    
    const details = encodeURIComponent(
      "Rencana Perjalanan Pendakian Bersama Tim Gede Expedition 2026.\n\n" +
      "📍 TITIK KUMPUL UTAMA: Rumah Hakam (Bogor)\n" +
      "Tautan Peta: " + meetingPointUrl + "\n\n" +
      "📅 Jum'at, 3 Juli 2026:\n" +
      "- Max 19.00: Wajib sampai di Rumah Hakam (Bogor)\n" +
      "- 21.00: Otw menuju Basecamp Putri & Istirahat\n\n" +
      "📅 Sabtu, 4 Juli 2026:\n" +
      "- 05.00: Sarapan di Basecamp\n" +
      "- 06.30: Mulai Jalan Pendakian menuju Suryakencana\n\n" +
      "📅 Minggu, 5 Juli 2026:\n" +
      "- 05.15: Summit Attack Puncak Gede\n" +
      "- 11.00: Packing & Perjalanan Turun Pulang\n\n" +
      "Wajib membawa KTP, Simaksi, Surat Sehat, Jaket Tebal, SB, dan Obat Pribadi!"
    );
    const location = encodeURIComponent("Rumah Hakam, Bogor, Jawa Barat, Indonesia");

    return `${baseUrl}&text=${title}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;
  };

  if (loading) return <div className="text-center p-12 text-slate-800 font-medium">Memuat Jadwal Perjalanan Baru...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      
      {/* CARD TOP BANNER + BUTTON GOOGLE CALENDAR */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 rounded-2xl border border-emerald-700 shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/20 tracking-wider uppercase">Jadwal Resmi</span>
          <h2 className="text-2xl font-black tracking-tight flex items-center">
            <i className="fa-solid fa-calendar-days mr-2.5"></i>Itinerary Pendakian Gede
          </h2>
          <p className="text-xs text-emerald-100 font-medium max-w-md">
            Rencana perjalanan lengkap 3 Hari 2 Malam, dimulai dari kumpul Jum'at malam di Rumah Hakam.
          </p>
        </div>
        
        {/* Tombol Add to Google Calendar */}
        <a 
          href={generateGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-emerald-800 text-xs font-black py-3 px-5 rounded-xl transition-all shadow-md shrink-0 gap-2 border border-white hover:scale-105 duration-200"
        >
          <i className="fa-brands fa-google text-sm text-red-500"></i>
          + Tambahkan Ke Google Calendar
        </a>
      </div>

      {/* INFORMASI TITIK KUMPUL QUICK LINK */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">📍</span>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Titik Kumpul Utama (Rumah Hakam)</h4>
            <p className="text-xs text-slate-500 font-medium">Batas kumpul Jum'at sore maksimal pukul 19.00 WIB. Pukul 21.00 WIB tepat gas menuju basecamp.</p>
          </div>
        </div>
        <a 
          href={meetingPointUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors gap-1.5 shrink-0 shadow-2xs"
        >
          <i className="fa-solid fa-map-location-dot"></i> Buka Google Maps
        </a>
      </div>

      {/* RENDER TIMELINE */}
      <div className="space-y-8">
        {itinerary.map((dayPlan, dayIdx) => (
          <div key={dayIdx} className="space-y-4">
            
            {/* Label Hari Pembatas */}
            <div className="flex items-center gap-3">
              <span className="bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-2xs">
                HARI 0{dayIdx + 1}
              </span>
              <h3 className="text-lg font-black text-slate-900 border-b-2 border-slate-200 flex-grow pb-1">
                {dayPlan.day}
              </h3>
            </div>

            {/* Garis Linier Timeline */}
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-3">
              {dayPlan.events.map((event, eventIdx) => (
                <div key={eventIdx} className="relative group">
                  
                  {/* Bulatan Pin Penunjuk Waktu */}
                  <div className="absolute -left-[31px] top-1.5 bg-white w-4 h-4 rounded-full border-4 border-emerald-600 group-hover:border-amber-500 transition-colors duration-150 z-10 shadow-2xs"></div>
                  
                  {/* Card Event Perjalanan */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs group-hover:border-slate-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                      <h4 className="font-bold text-slate-900 text-base">
                        {event.activity}
                      </h4>
                      <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                        <i className="fa-regular fa-clock mr-1 text-slate-400"></i> {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {event.notes}
                    </p>
                  </div>

                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
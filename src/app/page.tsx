'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  useEffect(() => {
    fetch('/api/expedition')
      .then(res => {
        if (!res.ok) throw new Error("API error status " + res.status);
        return res.json();
      })
      .then(d => setData(d))
      .catch(err => console.error("Gagal memuat data:", err));
  }, []);

  // 1. DATA PARSING GPX ASLI (Kombinasi koordinat spasial bumi & Elevasi MDPL)
  const gpxRawPoints = [
    { lat: -6.758150, lng: 107.007800, ele: 1618.7, name: "Basecamp Putri" },
    { lat: -6.758480, lng: 107.007490, ele: 1623.3 },
    { lat: -6.758740, lng: 107.007320, ele: 1629.1 },
    { lat: -6.758930, lng: 107.007150, ele: 1633.8 },
    { lat: -6.759040, lng: 107.007040, ele: 1636.5, name: "Pos 1 Legok Leunca" },
    { lat: -6.759660, lng: 107.006470, ele: 1648.9 },
    { lat: -6.760910, lng: 107.005720, ele: 1663.1 },
    { lat: -6.762340, lng: 107.005210, ele: 1804.8 },
    { lat: -6.764190, lng: 107.003650, ele: 1730.5 },
    { lat: -6.766720, lng: 107.002440, ele: 1837.5, name: "Pos 2 Buntut Lutung" },
    { lat: -6.767850, lng: 107.001270, ele: 1898.6 },
    { lat: -6.769460, lng: 106.999150, ele: 1970.8 },
    { lat: -6.770680, lng: 106.997060, ele: 2062.7 },
    { lat: -6.772450, lng: 106.995610, ele: 2135.0 },
    { lat: -6.773140, lng: 106.995140, ele: 2161.8, name: "Pos 3 Simpang Maleber" },
    { lat: -6.774340, lng: 106.993910, ele: 2216.1 },
    { lat: -6.776160, lng: 106.993330, ele: 2275.1 },
    { lat: -6.777670, lng: 106.992810, ele: 2356.0 },
    { lat: -6.779120, lng: 106.992320, ele: 2443.0 },
    { lat: -6.779710, lng: 106.992040, ele: 2483.6, name: "Pos 4 Alun-Alun Timur" },
    { lat: -6.781230, lng: 106.991870, ele: 2570.1 },
    { lat: -6.782870, lng: 106.991610, ele: 2645.8 },
    { lat: -6.784470, lng: 106.991260, ele: 2724.0 },
    { lat: -6.785300, lng: 106.991040, ele: 2758.2, name: "Pos 5 Surken Timur" },
    { lat: -6.787050, lng: 106.992730, ele: 2749.1 },
    { lat: -6.790510, lng: 106.992820, ele: 2732.6 },
    { lat: -6.794670, lng: 106.988670, ele: 2728.3 },
    { lat: -6.795710, lng: 106.984780, ele: 2725.2, name: "Alun-Alun Barat" },
    { lat: -6.793550, lng: 106.984390, ele: 2767.9 },
    { lat: -6.790640, lng: 106.983510, ele: 2887.7 },
    { lat: -6.789940, lng: 106.983160, ele: 2916.2, name: "Puncak Gede" }
  ];

  // 2. FUNGSI HAVERSINE (Menghitung Jarak KM Berdasarkan Lintang & Bujur Bumi)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius bumi dalam satuan KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 3. GENERATE JALUR KONTUR BERDASARKAN AKUMULASI JARAK
  let accumulatedDistance = 0;
  const geoTopologyData = gpxRawPoints.map((pt, idx) => {
    if (idx > 0) {
      const prev = gpxRawPoints[idx - 1];
      accumulatedDistance += calculateDistance(prev.lat, prev.lng, pt.lat, pt.lng);
    }
    return {
      ...pt,
      dist: parseFloat(accumulatedDistance.toFixed(3))
    };
  });

  if (!data) return <div className="text-center p-12 text-slate-800 font-medium">Sinkronisasi Data GPX Cloud...</div>;

  // Dimensi Kanvas SVG
  const width = 900;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 65 };

  const minEle = 1500;
  const maxEle = 3000;
  const totalKm = geoTopologyData[geoTopologyData.length - 1].dist;

  // Pemetakan Koordinat Matematika ke Piksel Layar
  const getX = (dist: number) => padding.left + (dist / totalKm) * (width - padding.left - padding.right);
  const getY = (ele: number) => height - padding.bottom - ((ele - minEle) / (maxEle - minEle)) * (height - padding.top - padding.bottom);

  // Menyusun string koordinat garis SVG
  const linePath = geoTopologyData.reduce((path, p, i) => {
    return i === 0 ? `M ${getX(p.dist)} ${getY(p.ele)}` : `${path} L ${getX(p.dist)} ${getY(p.ele)}`;
  }, "");

  // Menyusun bayangan (shading) area gunung di bawah garis grafik
  const areaPath = `${linePath} L ${getX(totalKm)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Board Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <i className="fa-solid fa-mountain text-emerald-600 mr-2"></i>Informasi Jalur GPX
          </h2>
          <div className="text-sm space-y-4 text-slate-800">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Jalur Pendakian</span>
              <span className="font-bold">{data.trailName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Start Elevasi</span>
              <span className="font-bold text-slate-700">{geoTopologyData[0].ele} mdpl</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Puncak Tertinggi</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{geoTopologyData[geoTopologyData.length - 1].ele} mdpl</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Total Jarak Trek</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{totalKm.toFixed(2)} KM</span>
            </div>
          </div>
        </div>

        {/* Map Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
            <i className="fa-solid fa-map-location-dot text-emerald-600 mr-2"></i>Peta Checkpoint Jalur Putri
          </h2>
          <div className="w-full flex-grow rounded-lg overflow-hidden border border-slate-200 min-h-[280px]">
            <LeafletMap />
          </div>
        </div>
      </div>

      {/* Grafik Garis Kontur GPX Aktual */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center">
          <i className="fa-solid fa-chart-line text-emerald-600 mr-2"></i>Profil Sudut Kemiringan Berdasarkan File GPX
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-medium">Grafik interpolasi kontinu dari titik koordinat GPS eksternal asli</p>
        
        <div className="w-full overflow-x-auto relative">
          {hoveredPoint && (
            <div 
              style={{ left: `${getX(hoveredPoint.dist) - 60}px`, top: `${getY(hoveredPoint.ele) - 65}px` }}
              className="absolute bg-slate-900 text-white text-[10px] p-2 rounded shadow-md z-50 text-center pointer-events-none transition-all duration-150 border border-slate-700"
            >
              <p className="font-bold border-b border-slate-700 pb-0.5 mb-1 text-emerald-400">{hoveredPoint.name || "Jalur Pendakian"}</p>
              <p>Alt: <span className="font-bold">{hoveredPoint.ele} mdpl</span></p>
              <p>Jarak: {hoveredPoint.dist} KM</p>
            </div>
          )}

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-50/50 rounded-xl border border-slate-100">
            {/* Sumbu Y (Elevasi Garis) */}
            {[1500, 1800, 2100, 2400, 2700, 3000].map((grid, i) => (
              <g key={i}>
                <line x1={padding.left} y1={getY(grid)} x2={width - padding.right} y2={getY(grid)} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padding.left - 12} y={getY(grid) + 4} text-anchor="end" className="text-[10px] fill-slate-400 font-bold">{grid}m</text>
              </g>
            ))}

            {/* Shading Gradasi */}
            <path d={areaPath} fill="url(#gpxGradient)" className="opacity-15" />

            {/* Garis Utama Kontur Jalur Putri */}
            <path d={linePath} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            <defs>
              <linearGradient id="gpxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* Render Titik Koordinat & Nama Pos Utama */}
            {geoTopologyData.map((p, idx) => {
              const cx = getX(p.dist);
              const cy = getY(p.ele);
              
              // Hanya gambar teks jika titik tersebut merupakan Pos Resmi (memiliki parameter name)
              return (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)}>
                  <circle cx={cx} cy={cy} r={p.name ? "6" : "3"} fill={p.name ? "#d97706" : "#059669"} />
                  {p.name && (
                    <g>
                      <line x1={cx} y1={cy} x2={cx} y2={height - padding.bottom} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx={cx} cy={cy} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={cx} y={height - 22} text-anchor="middle" className="text-[9px] font-bold fill-slate-700 bg-white">{p.name}</text>
                      <text x={cx} y={height - 11} text-anchor="middle" className="text-[8px] font-semibold fill-slate-400">{p.dist} km</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
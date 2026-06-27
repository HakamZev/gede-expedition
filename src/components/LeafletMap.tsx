'use client';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap() {
  useEffect(() => {
    // Cari kontainer peta lama agar tidak terjadi inisialisasi ganda (error _leaflet_id)
    const mapContainer = L.DomUtil.get('map');
    if (mapContainer) {
      (mapContainer as any)._leaflet_id = null;
    }

    // Inisialisasi Peta dengan mengaktifkan fitur interaksi penuh
    const map = L.map('map', {
      center: [-6.775, 106.995],
      zoom: 13,
      dragging: true,      // Mengizinkan peta digeser mouse/jari
      scrollWheelZoom: true // Mengizinkan zoom pakai scroll mouse
    });

    // Menggunakan tile layer OpenStreetMap standar
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Titik Checkpoint Utama Berdasarkan Berkas GPX Kamu
    const checkPoints: [number, number, string][] = [
      [-6.758150, 107.007800, "Basecamp Putri (1618m)"],
      [-6.759040, 107.007040, "Pos 1 Legok Leunca (1731m)"],
      [-6.766720, 107.002440, "Pos 2 Buntut Lutung (1837m)"],
      [-6.773140, 106.995140, "Pos 3 Simpang Maleber (2161m)"],
      [-6.779710, 106.992040, "Pos 4 Alun-Alun Timur (2483m)"],
      [-6.785300, 106.991040, "Pos 5 Surken Timur (2758m)"],
      [-6.795710, 106.984780, "Alun-Alun Barat (2725m)"],
      [-6.789940, 106.983160, "Puncak Gunung Gede (2916m)"]
    ];

    // Mengonversi array titik menjadi objek LatLng resmi Leaflet
    const latLngs = checkPoints.map(p => [p[0], p[1]] as [number, number]);

    // Menggambar garis jalur (polyline) berwarna hijau botani
    const polyline = L.polyline(latLngs, { 
      color: '#059669', 
      weight: 5,
      opacity: 0.85
    }).addTo(map);

    // Otomatis memposisikan kamera peta di tengah-tengah seluruh jalur pendakian
    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

    // Merender penanda lingkaran (circleMarker) interaktif di setiap pos pendakian
    checkPoints.forEach(p => {
      L.circleMarker([p[0], p[1]], { 
        radius: 7, 
        color: '#065f46', 
        fillColor: '#34d399', 
        fillOpacity: 1,
        weight: 2
      })
      .addTo(map)
      .bindPopup(`<div class="font-sans font-bold text-slate-800 text-xs">${p[2]}</div>`);
    });

    // Memaksa Leaflet menghitung ulang dimensi kontainer setelah komponen termuat sempurna
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, []);

  return (
    <div 
      id="map" 
      className="w-full h-full cursor-grab active:cursor-grabbing" 
      style={{ minHeight: '100%', minWidth: '100%' }}
    ></div>
  );
}
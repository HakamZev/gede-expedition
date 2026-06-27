import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">
        {/* Mengubah z-50 menjadi z-[9999] agar mutlak berada di atas kontrol peta Leaflet */}
        <header className="bg-emerald-800 text-white sticky top-0 z-[99999] shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-mountain-sun text-3xl text-amber-400"></i>
              <div><h1 className="text-xl font-bold">GEDE EXPEDITION 2026</h1></div>
            </div>
            <nav className="flex gap-1 flex-wrap">
              <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Dashboard</Link>
              <Link href="/team" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Tim & Perkap</Link>
              <Link href="/gear" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Personal Gear</Link>   
              <Link href="/schedule" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Schedule & Itinerary</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
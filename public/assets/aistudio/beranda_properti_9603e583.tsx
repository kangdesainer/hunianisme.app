// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronDown, ChevronLeft, ChevronRight, 
  Search, MapPin, BedDouble, Bath, Maximize, Home, Briefcase, Building, Map, ImageIcon
} from 'lucide-react';

// --- DATA SKELETON (TEMPLATE KOSONG) ---
// Membuat array berisi 5 item kosong untuk template list properti
const skeletonItems = Array.from({ length: 5 }, (_, i) => ({ id: i }));

const locationsList = ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Karawang'];

// --- KOMPONEN BANTUAN ---

// Komponen Kartu Properti (Skeleton Card)
const PropertyCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
    {/* Skeleton Gambar */}
    <div className="relative h-48 bg-gray-200 flex items-center justify-center">
      <ImageIcon className="text-gray-400 opacity-50" size={48} />
    </div>
    
    {/* Skeleton Konten Teks */}
    <div className="p-4 flex flex-col flex-grow">
      <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
      <div className="h-7 bg-gray-200 rounded-md w-2/3 mb-6"></div>
      
      {/* Skeleton Spesifikasi Kamar/Luas */}
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 gap-3">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
      </div>
    </div>
  </div>
);

// Komponen Carousel Kustom dengan tombol manual
const PropertyCarousel = ({ title, items, hasSeeAll = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Deteksi ukuran layar untuk jumlah item
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize(); // Inisialisasi
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6 px-4 md:px-0">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={prevSlide} 
            disabled={currentIndex === 0}
            className={`p-2 rounded-full border ${currentIndex === 0 ? 'border-gray-200 text-gray-300' : 'border-blue-600 text-blue-600 hover:bg-blue-50'} transition`}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide} 
            disabled={currentIndex >= maxIndex}
            className={`p-2 rounded-full border ${currentIndex >= maxIndex ? 'border-gray-200 text-gray-300' : 'border-blue-600 text-blue-600 hover:bg-blue-50'} transition`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden px-4 md:px-0">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0" style={{ width: `calc(${100 / itemsPerPage}% - ${itemsPerPage > 1 ? 16 * (itemsPerPage - 1) / itemsPerPage : 0}px)` }}>
              <PropertyCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Tombol navigasi mobile (di bawah) */}
      <div className="flex justify-center mt-6 gap-4 md:hidden">
        <button onClick={prevSlide} disabled={currentIndex === 0} className="p-3 bg-gray-100 rounded-full disabled:opacity-50"><ChevronLeft size={20} /></button>
        <button onClick={nextSlide} disabled={currentIndex >= maxIndex} className="p-3 bg-gray-100 rounded-full disabled:opacity-50"><ChevronRight size={20} /></button>
      </div>

      {hasSeeAll && (
        <div className="mt-8 text-center">
          <button className="px-6 py-2.5 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Lihat Semua {title}
          </button>
        </div>
      )}
    </div>
  );
};


// --- KOMPONEN UTAMA (APP) ---
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo: Kotak Abu-abu (Skeleton) */}
            <div className="flex-shrink-0 cursor-pointer">
              <div className="w-48 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-semibold text-sm border border-gray-300 border-dashed">
                Logo Horizontal (Gambar)
              </div>
            </div>
            
            {/* Hamburger Button (Titik 3 / Hamburger) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY MENU (Sidebar) */}
      <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMenuOpen(false)}></div>
      
      <div className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 flex justify-end border-b">
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          {/* Tipe Properti Accordion */}
          <div className="mb-2 border-b border-gray-100 pb-2">
            <button onClick={() => toggleAccordion('tipe')} className="flex justify-between items-center w-full py-3 text-left font-semibold hover:text-blue-600">
              Tipe Properti <ChevronDown size={18} className={`transition-transform ${openAccordion === 'tipe' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'tipe' ? 'max-h-48' : 'max-h-0'}`}>
              <ul className="pl-4 space-y-3 py-2 text-gray-600">
                <li className="hover:text-blue-600 cursor-pointer flex items-center gap-2"><Home size={16}/> Rumah</li>
                <li className="hover:text-blue-600 cursor-pointer flex items-center gap-2"><Building size={16}/> Apartemen</li>
                <li className="hover:text-blue-600 cursor-pointer flex items-center gap-2"><Briefcase size={16}/> Ruko</li>
                <li className="hover:text-blue-600 cursor-pointer flex items-center gap-2"><Map size={16}/> Tanah</li>
              </ul>
            </div>
          </div>

          {/* Harga Accordion */}
          <div className="mb-2 border-b border-gray-100 pb-2">
            <button onClick={() => toggleAccordion('harga')} className="flex justify-between items-center w-full py-3 text-left font-semibold hover:text-blue-600">
              Harga <ChevronDown size={18} className={`transition-transform ${openAccordion === 'harga' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'harga' ? 'max-h-56' : 'max-h-0'}`}>
              <ul className="pl-4 space-y-3 py-2 text-gray-600">
                <li className="hover:text-blue-600 cursor-pointer">Di bawah 1 Milyar</li>
                <li className="hover:text-blue-600 cursor-pointer">1 Milyar - 2 Milyar</li>
                <li className="hover:text-blue-600 cursor-pointer">2 Milyar - 3 Milyar</li>
                <li className="hover:text-blue-600 cursor-pointer">3 Milyar - 5 Milyar</li>
                <li className="hover:text-blue-600 cursor-pointer">5 Milyar ke atas</li>
              </ul>
            </div>
          </div>

          {/* Lokasi Accordion */}
          <div className="mb-2 border-b border-gray-100 pb-2">
            <button onClick={() => toggleAccordion('lokasi')} className="flex justify-between items-center w-full py-3 text-left font-semibold hover:text-blue-600">
              Lokasi <ChevronDown size={18} className={`transition-transform ${openAccordion === 'lokasi' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'lokasi' ? 'max-h-64' : 'max-h-0'}`}>
              <ul className="pl-4 space-y-3 py-2 text-gray-600">
                {locationsList.map(loc => (
                  <li key={loc} className="hover:text-blue-600 cursor-pointer">{loc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tentang Kami */}
          <div className="mt-4">
            <a href="#" className="block py-3 font-semibold hover:text-blue-600">Tentang Kami</a>
          </div>
        </div>
      </div>

      {/* HERO BANNER & SEARCH */}
      <section className="relative">
        {/* Banner: Kotak Abu-abu */}
        <div className="w-full h-[400px] md:h-[500px] bg-gray-200 flex items-center justify-center border-b border-gray-300">
          <span className="text-gray-400 font-bold text-2xl md:text-4xl tracking-widest uppercase">Banner Website</span>
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end items-center px-4 pb-12 md:pb-20 text-center">
          {/* Penelusuran Properti */}
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl flex items-center p-2">
            <div className="flex-grow flex items-center pl-4 pr-2">
              <Search className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Cari lokasi, nama properti, atau developer..." 
                className="w-full py-3 focus:outline-none text-gray-700 bg-transparent"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto py-12">
        
        {/* PROYEK BARU */}
        <PropertyCarousel title="Proyek Baru" items={skeletonItems} />

        {/* LOKASI PROPERTI */}
        <section className="mb-16 px-4 md:px-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Lokasi Properti</h2>
          {/* Grid 3 Kolom 2 Baris (Desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {locationsList.map((loc, idx) => (
              <button 
                key={idx} 
                className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-gray-700 font-semibold group"
              >
                <MapPin size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                {loc}
              </button>
            ))}
          </div>
        </section>

        {/* ETALASE RUMAH */}
        <PropertyCarousel title="Rumah" items={skeletonItems} hasSeeAll={true} />

        {/* ETALASE RUKO */}
        <PropertyCarousel title="Ruko" items={skeletonItems} hasSeeAll={true} />

        {/* ETALASE TANAH */}
        <PropertyCarousel title="Tanah" items={skeletonItems} hasSeeAll={true} />

        {/* ETALASE APARTEMEN */}
        <PropertyCarousel title="Apartemen" items={skeletonItems} hasSeeAll={true} />

        {/* SIMULASI KPR BANNER */}
        <section className="mb-16 px-4 md:px-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ingin Tahu Cicilan Rumah Anda?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl text-lg">Hitung estimasi cicilan per bulan dengan mudah dan cepat. Cukup masukkan harga properti, DP, dan tenor.</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg transform hover:-translate-y-1 transition-all">
              Simulasi KPR Sekarang
            </button>
          </div>
        </section>

        {/* ARTIKEL */}
        <section className="mb-12 px-4 md:px-0">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Artikel & Berita Terbaru</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                {/* Skeleton Gambar Artikel */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="text-gray-400 opacity-50" size={32} />
                </div>
                {/* Skeleton Konten Teks Artikel */}
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="w-32 h-10 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-xs mb-6 border border-gray-700">Logo Footer</div>
            <p className="text-sm">Portal properti terpercaya untuk menemukan rumah, apartemen, ruko, dan tanah impian Anda di berbagai kota strategis.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Tipe Properti</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Rumah</a></li>
              <li><a href="#" className="hover:text-white transition">Apartemen</a></li>
              <li><a href="#" className="hover:text-white transition">Ruko</a></li>
              <li><a href="#" className="hover:text-white transition">Tanah</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Lokasi Favorit</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Jakarta</a></li>
              <li><a href="#" className="hover:text-white transition">Tangerang</a></li>
              <li><a href="#" className="hover:text-white transition">Bekasi</a></li>
              <li><a href="#" className="hover:text-white transition">Depok</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition">Kontak</a></li>
              <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          &copy; 2026 Portal Properti. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
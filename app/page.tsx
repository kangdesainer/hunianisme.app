'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { 
  ChevronLeft, ChevronRight, Search, MapPin, BedDouble, Bath, 
  Maximize, Home, Calculator, ArrowRight, Sparkles, Filter, 
  Building2, Building, Compass, BookOpen, ShieldCheck, CheckCircle2, X
} from 'lucide-react';
import { 
  PropertyListing, Article 
} from '@/types/property';
import { 
  getStoredProperties, getStoredArticles, 
  INITIAL_PROPERTIES, INITIAL_ARTICLES,
  formatRupiah, getPropertySlug, getArticleSlug,
  DEFAULT_PROPERTY_IMAGE, DEFAULT_ARTICLE_IMAGE,
  fetchServerDataAndSync
} from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';

const locationsList = ['Semua Lokasi', 'Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Karawang'];

interface PropertyCardProps {
  item: PropertyListing;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ item }) => {
  const slug = getPropertySlug(item);
  return (
    <Link 
      href={`/properti/${slug}`}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-emerald-300 overflow-hidden flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Property Photo & Badges */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <SafeImage
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          referrerPolicy="no-referrer"
          fallbackSrc={DEFAULT_PROPERTY_IMAGE}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 bg-emerald-700/95 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-xs">
            {item.type}
          </span>
          {item.badge && (
            <span className="px-2.5 py-1 bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-xs">
              {item.badge}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
          <MapPin size={12} className="text-emerald-400" />
          {item.city}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Price */}
        <div className="text-xl font-black text-emerald-800 tracking-tight mb-1">
          {formatRupiah(item.price)}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-1 mb-1">
          {item.title}
        </h3>

        {/* Address */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-4 flex items-center gap-1">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          <span>{item.address}</span>
        </p>
        
        {/* Specs Grid */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 text-xs text-gray-600 gap-2">
          <div className="flex items-center gap-1 font-medium" title="Kamar Tidur">
            <BedDouble size={15} className="text-emerald-600 shrink-0" />
            <span>{item.bedrooms > 0 ? `${item.bedrooms} KT` : '-'}</span>
          </div>
          <div className="flex items-center gap-1 font-medium" title="Kamar Mandi">
            <Bath size={15} className="text-teal-600 shrink-0" />
            <span>{item.bathrooms > 0 ? `${item.bathrooms} KM` : '-'}</span>
          </div>
          <div className="flex items-center gap-1 font-medium" title="Luas Bangunan">
            <Maximize size={15} className="text-emerald-500 shrink-0" />
            <span>{item.buildingArea > 0 ? `${item.buildingArea}m²` : '-'}</span>
          </div>
          <div className="flex items-center gap-1 font-medium" title="Luas Tanah">
            <Home size={15} className="text-amber-500 shrink-0" />
            <span>{item.surfaceArea > 0 ? `${item.surfaceArea}m²` : '-'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Carousel Component
const PropertyCarousel = ({ 
  title, 
  items, 
  badgeText,
  seeAllHref
}: { 
  title: string; 
  items: PropertyListing[]; 
  badgeText?: string;
  seeAllHref?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-14">
      <div className="flex justify-between items-end mb-6 px-4 md:px-0">
        <div>
          {badgeText && (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md mb-2 inline-block">
              {badgeText}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        </div>

        {/* Carousel controls & link */}
        <div className="flex items-center gap-3">
          {seeAllHref && (
            <Link 
              href={seeAllHref} 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hidden sm:inline-flex items-center gap-1 mr-2"
            >
              Lihat Semua
              <ArrowRight size={13} />
            </Link>
          )}
          <button 
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-2.5 rounded-full border border-gray-200 transition ${
              currentIndex === 0 
                ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' 
                : 'hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 active:scale-95'
            }`}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`p-2.5 rounded-full border border-gray-200 transition ${
              currentIndex >= maxIndex 
                ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' 
                : 'hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 active:scale-95'
            }`}
            aria-label="Next Slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden px-4 md:px-0 -mx-2">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className="px-2 shrink-0"
              style={{ width: `${100 / itemsPerPage}%` }}
            >
              <PropertyCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyListing[]>(INITIAL_PROPERTIES);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  
  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  useEffect(() => {
    fetchServerDataAndSync().then((data) => {
      if (data) {
        if (data.properties && data.properties.length > 0) setProperties(data.properties);
        if (data.articles && data.articles.length > 0) setArticles(data.articles);
      }
    });

    const syncData = () => {
      setProperties(getStoredProperties());
      setArticles(getStoredArticles());
    };

    syncData();
    window.addEventListener('hunianisme_data_changed', syncData);
    return () => {
      window.removeEventListener('hunianisme_data_changed', syncData);
    };
  }, []);

  // Filter properties based on search
  const filteredProperties = properties.filter((prop) => {
    const matchKeyword = 
      !searchKeyword ||
      prop.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (prop.developer && prop.developer.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchType = selectedType === 'all' || prop.type === selectedType;

    const matchLocation = 
      selectedLocation === 'Semua Lokasi' ||
      prop.city.toLowerCase() === selectedLocation.toLowerCase();

    let matchPrice = true;
    if (selectedPriceRange === 'under-1m') matchPrice = prop.price < 1000000000;
    else if (selectedPriceRange === '1m-2m') matchPrice = prop.price >= 1000000000 && prop.price <= 2000000000;
    else if (selectedPriceRange === '2m-3m') matchPrice = prop.price > 2000000000 && prop.price <= 3000000000;
    else if (selectedPriceRange === '3m-5m') matchPrice = prop.price > 3000000000 && prop.price <= 5000000000;
    else if (selectedPriceRange === 'above-5m') matchPrice = prop.price > 5000000000;

    return matchKeyword && matchType && matchLocation && matchPrice;
  });

  // Grouped properties for carousels
  const proyekBaruList = filteredProperties.filter(
    (p) => p.badge?.toLowerCase().includes('proyek') || p.badge?.toLowerCase().includes('baru') || (p as any).type === 'proyek-baru'
  );
  const rumahList = filteredProperties.filter((p) => p.type === 'rumah');
  const apartemenList = filteredProperties.filter((p) => p.type === 'apartemen');
  const rukoList = filteredProperties.filter((p) => p.type === 'ruko');
  const tanahList = filteredProperties.filter((p) => p.type === 'tanah');

  // Ambil maksimal 4 artikel terbaru yang berstatus published
  const latestArticles = [...articles]
    .filter((art) => art.status !== 'draft')
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        return dateB - dateA;
      }
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) return numB - numA;
      return b.id.localeCompare(a.id);
    })
    .slice(0, 4);

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedType('all');
    setSelectedLocation('Semua Lokasi');
    setSelectedPriceRange('all');
  };

  const hasActiveFilters = 
    searchKeyword !== '' || 
    selectedType !== 'all' || 
    selectedLocation !== 'Semua Lokasi' || 
    selectedPriceRange !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <HeaderNav />

      {/* HERO BANNER & SEARCH */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white pt-16 pb-24 md:pt-20 md:pb-28">
        {/* Background photo */}
        <div className="absolute inset-0 opacity-20 mix-blend-luminosity">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Hunian Tropis Modern"
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Temukan Hunian Nyaman <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              di Jabodetabek
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
            Solusi cari hunian yang tepat Bersama Hunianisme
          </p>

          {/* SEARCH BOX CONTAINER */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl text-gray-800 border border-gray-100 flex flex-col gap-3.5">
              {/* Row 1: Full-Width Search Input & Search Action Button */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <div className="flex-1 flex items-center pl-4 pr-3 py-3.5 w-full bg-slate-50 border border-gray-200 rounded-2xl focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                  <Search className="text-gray-400 mr-3 shrink-0" size={20} />
                  <input 
                    type="text" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Cari properti, nama klaster, jalan, atau developer..." 
                    className="w-full text-sm sm:text-base focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Hapus kata kunci"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <Link 
                  href={`/properti?tipe=${selectedType}&lokasi=${encodeURIComponent(selectedLocation)}${searchKeyword ? `&q=${encodeURIComponent(searchKeyword)}` : ''}`}
                  className="w-full sm:w-auto px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Cari Properti</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Row 2: Dropdowns placed underneath so they don't block typing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-left">
                {/* Tipe Selector (Real property types only) */}
                <div className="bg-slate-50 hover:bg-slate-100/80 border border-gray-200 rounded-xl px-3.5 py-2 transition">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Tipe Properti
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    aria-label="Pilih Tipe Properti"
                    className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="rumah">Rumah</option>
                    <option value="apartemen">Apartement</option>
                    <option value="ruko">Ruko</option>
                    <option value="tanah">Tanah</option>
                  </select>
                </div>

                {/* Lokasi Selector */}
                <div className="bg-slate-50 hover:bg-slate-100/80 border border-gray-200 rounded-xl px-3.5 py-2 transition">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Lokasi Wilayah
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    aria-label="Pilih Lokasi"
                    className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {locationsList.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Budget Range */}
                <div className="bg-slate-50 hover:bg-slate-100/80 border border-gray-200 rounded-xl px-3.5 py-2 transition">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Rentang Budget
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    aria-label="Pilih Rentang Budget"
                    className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Budget</option>
                    <option value="under-1m">&lt; 1 Milyar</option>
                    <option value="1m-2m">1 - 2 Milyar</option>
                    <option value="2m-3m">2 - 3 Milyar</option>
                    <option value="3m-5m">3 - 5 Milyar</option>
                    <option value="above-5m">&gt; 5 Milyar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Category Icons Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold">
            <Link 
              href="/properti?tipe=rumah" 
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-xs flex items-center gap-2"
            >
              <Home size={15} className="text-emerald-400" />
              <span>Rumah</span>
            </Link>
            <Link 
              href="/properti?tipe=apartemen" 
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-xs flex items-center gap-2"
            >
              <Building size={15} className="text-emerald-400" />
              <span>Apartement</span>
            </Link>
            <Link 
              href="/properti?tipe=ruko" 
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-xs flex items-center gap-2"
            >
              <Building2 size={15} className="text-amber-400" />
              <span>Ruko</span>
            </Link>
            <Link 
              href="/properti?tipe=tanah" 
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-xs flex items-center gap-2"
            >
              <Compass size={15} className="text-teal-400" />
              <span>Tanah</span>
            </Link>
            <Link 
              href="/simulasi-kpr" 
              className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-200 transition backdrop-blur-xs flex items-center gap-2 font-bold"
            >
              <Calculator size={15} className="text-amber-400" />
              <span>Kalkulator KPR</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CAROUSELS CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <Filter size={15} className="text-emerald-700" />
              <span>Menampilkan hasil filter:</span>
              {searchKeyword && <strong className="bg-white px-2 py-0.5 rounded border border-emerald-200">&quot;{searchKeyword}&quot;</strong>}
              {selectedType !== 'all' && <strong className="bg-white px-2 py-0.5 rounded border border-emerald-200">{selectedType}</strong>}
              {selectedLocation !== 'Semua Lokasi' && <strong className="bg-white px-2 py-0.5 rounded border border-emerald-200">{selectedLocation}</strong>}
              {selectedPriceRange !== 'all' && <strong className="bg-white px-2 py-0.5 rounded border border-emerald-200">{selectedPriceRange}</strong>}
            </div>
            <button 
              onClick={resetFilters}
              className="font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Empty Search Result State */}
        {filteredProperties.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Properti yang Sesuai</h3>
            <p className="text-sm text-gray-500 mb-6">
              {properties.length === 0 
                ? 'Belum ada katalog properti yang tersedia saat ini. Silakan kunjungi kembali nanti untuk pembaruan listing terbaru.'
                : 'Coba ubah kriteria pencarian atau pilih lokasi lain untuk menemukan listing yang tersedia.'}
            </p>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition shadow-md shadow-emerald-700/20"
              >
                Tampilkan Semua Listing
              </button>
            )}
          </div>
        )}

        {/* ETALASE PROYEK BARU */}
        {proyekBaruList.length > 0 && (
          <PropertyCarousel 
            title="Proyek Baru Pilihan" 
            badgeText="Developer Terpercaya"
            items={proyekBaruList} 
            seeAllHref="/properti"
          />
        )}

        {/* ETALASE RUMAH */}
        <PropertyCarousel 
          title="Rumah" 
          badgeText="Hunian Keluarga"
          items={rumahList} 
          seeAllHref="/properti?tipe=rumah"
        />

        {/* ETALASE APARTEMEN */}
        <PropertyCarousel 
          title="Apartement" 
          badgeText="Gaya Hidup Modern"
          items={apartemenList} 
          seeAllHref="/properti?tipe=apartemen"
        />

        {/* ETALASE RUKO */}
        <PropertyCarousel 
          title="Ruko" 
          badgeText="Ruang Usaha & Bisnis"
          items={rukoList} 
          seeAllHref="/properti?tipe=ruko"
        />

        {/* ETALASE TANAH */}
        <PropertyCarousel 
          title="Tanah" 
          badgeText="Lahan Siap Bangun"
          items={tanahList} 
          seeAllHref="/properti?tipe=tanah"
        />

        {/* STANDALONE KPR BANNER */}
        <section className="mb-16">
          <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight text-white">
                Ingin Tahu Cicilan Rumah Idaman Anda?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 mb-6 max-w-xl mx-auto font-normal leading-relaxed">
                Hitung estimasi cicilan KPR bulanan Anda dengan mudah lengkap dengan estimasi dana yang perlu disiapkan sebelum proses akad kredit.
              </p>
              <Link 
                href="/simulasi-kpr"
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:via-yellow-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-bold py-2.5 px-6 sm:py-3 sm:px-7 rounded-full shadow-md shadow-amber-500/20 border border-amber-300 transform hover:-translate-y-0.5 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <span>Buka Kalkulator Simulasi KPR</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ARTIKEL & BERITA TERBARU */}
        <section id="artikel-section" className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md mb-2 inline-block">
                Edukasi &amp; Tips
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Artikel &amp; Berita Properti Terbaru
              </h2>
            </div>
            <Link 
              href="/artikel"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-2 sm:mt-0"
            >
              Lihat Semua Artikel &rarr;
            </Link>
          </div>

          {latestArticles.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
              Belum ada artikel berita yang dipublikasikan saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestArticles.map((art) => {
                const slug = getArticleSlug(art);
                return (
                  <Link 
                    key={art.id} 
                    href={`/artikel/${slug}`}
                    className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-300 overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1.5"
                  >
                    {/* Gambar Artikel */}
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <SafeImage
                        src={art.imageUrl}
                        alt={art.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        referrerPolicy="no-referrer"
                        fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-emerald-800/85 backdrop-blur-md text-white text-[11px] font-bold rounded-lg uppercase tracking-wider border border-emerald-500/30">
                          {art.category}
                        </span>
                      </div>
                    </div>

                    {/* Konten Teks Artikel */}
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="text-xs text-gray-400 font-medium mb-2 flex items-center justify-between">
                          <span>{art.publishedAt}</span>
                          <span>{art.readTime}</span>
                        </div>

                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-2 mb-2 leading-snug">
                          {art.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                          {art.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-bold group-hover:text-emerald-800 group-hover:translate-x-1 transition-all">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <FooterNav />
    </div>
  );
}

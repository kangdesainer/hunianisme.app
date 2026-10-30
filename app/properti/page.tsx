'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { 
  Building2, Search, SlidersHorizontal, MapPin, BedDouble, Bath, 
  Maximize, Home, ChevronRight, X, ArrowUpDown, Filter, Sparkles
} from 'lucide-react';
import { 
  getStoredProperties, INITIAL_PROPERTIES, formatRupiah, getPropertySlug, DEFAULT_PROPERTY_IMAGE 
} from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import { PropertyListing, PropertyType } from '@/types/property';

function PropertyCatalogContent() {
  const searchParams = useSearchParams();
  const urlType = searchParams.get('tipe');
  const urlLocation = searchParams.get('lokasi');

  const [properties, setProperties] = useState<PropertyListing[]>(INITIAL_PROPERTIES);
  const [keyword, setKeyword] = useState<string>('');
  const [userType, setUserType] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const selectedType = userType ?? (urlType || 'all');
  const setSelectedType = (t: string) => setUserType(t);

  const selectedLocation = userLocation ?? (urlLocation || 'Semua Lokasi');
  const setSelectedLocation = (loc: string) => setUserLocation(loc);

  useEffect(() => {
    const sync = () => {
      setProperties(getStoredProperties());
    };
    sync();
    window.addEventListener('hunianisme_data_changed', sync);
    return () => {
      window.removeEventListener('hunianisme_data_changed', sync);
    };
  }, []);

  // Unique cities list
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    properties.forEach((p) => {
      if (p.city) cities.add(p.city);
    });
    return Array.from(cities);
  }, [properties]);

  // Filtered & sorted properties
  const filteredList = useMemo(() => {
    let list = properties.filter((p) => {
      // Keyword match
      if (keyword.trim()) {
        const query = keyword.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchCity = p.city.toLowerCase().includes(query);
        const matchAddr = p.address.toLowerCase().includes(query);
        const matchDev = p.developer ? p.developer.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchCity && !matchAddr && !matchDev) return false;
      }

      // Type match
      if (selectedType !== 'all' && p.type !== selectedType) return false;

      // Location match
      if (selectedLocation !== 'Semua Lokasi' && p.city.toLowerCase() !== selectedLocation.toLowerCase()) {
        return false;
      }

      // Bedrooms match
      if (minBedrooms > 0 && p.bedrooms < minBedrooms) return false;

      // Price match
      if (selectedPriceRange === 'under-1m' && p.price >= 1000000000) return false;
      if (selectedPriceRange === '1m-2m' && (p.price < 1000000000 || p.price > 2000000000)) return false;
      if (selectedPriceRange === '2m-3m' && (p.price <= 2000000000 || p.price > 3000000000)) return false;
      if (selectedPriceRange === '3m-5m' && (p.price <= 3000000000 || p.price > 5000000000)) return false;
      if (selectedPriceRange === 'above-5m' && p.price <= 5000000000) return false;

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // newest by createdAt
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [properties, keyword, selectedType, selectedLocation, selectedPriceRange, minBedrooms, sortBy]);

  const resetFilters = () => {
    setKeyword('');
    setSelectedType('all');
    setSelectedLocation('Semua Lokasi');
    setSelectedPriceRange('all');
    setMinBedrooms(0);
    setSortBy('newest');
  };

  const hasActiveFilters = 
    keyword !== '' || 
    selectedType !== 'all' || 
    selectedLocation !== 'Semua Lokasi' || 
    selectedPriceRange !== 'all' || 
    minBedrooms > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <HeaderNav />

      {/* Hero Header */}
      <div className="bg-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition">Beranda</Link>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-white font-medium">Katalog Properti</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Pencarian Listing Terlengkap
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Jelajahi Semua Properti Hunianisme
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                Temukan rumah idaman, apartemen strategis, tanah, serta ruko dari pengembang terpercaya dengan simulasi KPR terintegrasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama properti, lokasi, jalan, developer..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Location Select (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Pilih Lokasi Properti"
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              >
                <option value="Semua Lokasi">Semua Lokasi</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Tangerang">Tangerang</option>
                <option value="Bekasi">Bekasi</option>
                <option value="Bogor">Bogor</option>
                <option value="Karawang">Karawang</option>
                <option value="Depok">Depok</option>
                {availableCities.map((c) => {
                  if (['jakarta', 'tangerang', 'bekasi', 'bogor', 'karawang', 'depok'].includes(c.toLowerCase())) return null;
                  return <option key={c} value={c}>{c}</option>;
                })}
              </select>
            </div>

            {/* Price Select (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                aria-label="Pilih Rentang Harga"
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              >
                <option value="all">Semua Harga</option>
                <option value="under-1m">&lt; Rp 1 Milyar</option>
                <option value="1m-2m">Rp 1M - 2 Milyar</option>
                <option value="2m-3m">Rp 2M - 3 Milyar</option>
                <option value="3m-5m">Rp 3M - 5 Milyar</option>
                <option value="above-5m">&gt; Rp 5 Milyar</option>
              </select>
            </div>

            {/* Sort Select (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan Listing"
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              >
                <option value="newest">Listing Terbaru</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
            </div>

          </div>

          {/* Type Segmented Controls & Extra Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'all', label: 'Semua Tipe' },
                { id: 'rumah', label: 'Rumah' },
                { id: 'apartemen', label: 'Apartement' },
                { id: 'ruko', label: 'Ruko' },
                { id: 'tanah', label: 'Tanah' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedType === t.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Bedroom Quick Filter */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="font-semibold">Kamar:</span>
                {[0, 1, 2, 3, 4].map((beds) => (
                  <button
                    key={beds}
                    onClick={() => setMinBedrooms(beds)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      minBedrooms === beds
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {beds === 0 ? 'All' : `${beds}+`}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition border border-red-200"
                >
                  <X size={13} />
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tidak Ada Listing Properti yang Cocok
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {properties.length === 0 
                ? 'Belum ada data properti yang tersimpan. Anda dapat menambahkan listing baru melalui halaman admin.'
                : 'Coba ubah kata kunci pencarian, tipe properti, atau perluas rentang budget harga Anda.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 pb-16">
            {filteredList.map((item) => {
              const slug = getPropertySlug(item);
              return (
                <Link
                  key={item.id}
                  href={`/properti/${slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100/80 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                    />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-md">
                        {item.badge}
                      </div>
                    )}

                    {/* City Chip */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-400" />
                      <span>{item.city}</span>
                    </div>

                    {/* Type Tag */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                      {item.type}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price */}
                      <div className="text-xl font-black text-emerald-700 tracking-tight mb-1">
                        {formatRupiah(item.price)}
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-extrabold text-gray-900 group-hover:text-emerald-700 transition line-clamp-1 mb-1">
                        {item.title}
                      </h2>

                      {/* Address */}
                      <p className="text-xs text-gray-500 line-clamp-1 mb-4">
                        {item.address}
                      </p>
                    </div>

                    {/* Specs Grid */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-600 gap-2">
                      <div className="flex items-center gap-1 font-medium" title="Kamar Tidur">
                        <BedDouble size={15} className="text-emerald-600 shrink-0" />
                        <span>{item.bedrooms > 0 ? `${item.bedrooms} KT` : '-'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium" title="Kamar Mandi">
                        <Bath size={15} className="text-indigo-500 shrink-0" />
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
            })}
          </div>
        )}

      </main>

      <FooterNav />
    </div>
  );
}

export default function PropertyCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Memuat Katalog Properti...</p>
        </div>
      </div>
    }>
      <PropertyCatalogContent />
    </Suspense>
  );
}

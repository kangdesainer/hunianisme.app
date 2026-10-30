'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { 
  Building2, MapPin, BedDouble, Bath, Maximize, Home, CheckCircle2, 
  Phone, MessageSquare, Calculator, Tag, Share2, Check, ArrowLeft,
  ChevronRight, Calendar, User, ShieldCheck, Sparkles, Building
} from 'lucide-react';
import { 
  getStoredProperties, INITIAL_PROPERTIES, formatRupiah, calculateKPR, 
  getPropertyBySlugOrId, getPropertySlug, DEFAULT_PROPERTY_IMAGE 
} from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import { PropertyListing } from '@/types/property';

export default function DynamicPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawParamSlug = params?.slug;
  const paramSlug = typeof rawParamSlug === 'string' ? rawParamSlug : (Array.isArray(rawParamSlug) ? rawParamSlug[0] : '');

  const [allProperties, setAllProperties] = useState<PropertyListing[]>(() => {
    if (typeof window === 'undefined') return [];
    return getStoredProperties();
  });
  const [property, setProperty] = useState<PropertyListing | null>(() => {
    if (typeof window === 'undefined') return null;
    const pathSlug = window.location.pathname.split('/').filter(Boolean).pop() || '';
    return getPropertyBySlugOrId(paramSlug || pathSlug);
  });
  const [activeImage, setActiveImage] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const pathSlug = window.location.pathname.split('/').filter(Boolean).pop() || '';
    const found = getPropertyBySlugOrId(paramSlug || pathSlug);
    return found?.imageUrl || '';
  });
  const [copied, setCopied] = useState<boolean>(false);

  // Embedded KPR parameters
  const [kprDpPercent, setKprDpPercent] = useState<number>(20);
  const [kprTenorYears, setKprTenorYears] = useState<number>(15);
  const [kprInterest, setKprInterest] = useState<number>(5.75);

  useEffect(() => {
    const handleSync = () => {
      const pathSlug = typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean).pop() || '') : '';
      const activeSlug = paramSlug || pathSlug;
      const list = getStoredProperties();
      setAllProperties(list);
      if (activeSlug) {
        const found = getPropertyBySlugOrId(activeSlug, list);
        setProperty(found);
        if (found) {
          setActiveImage(found.imageUrl);
        }
      }
    };

    handleSync();
    window.addEventListener('hunianisme_data_changed', handleSync);
    return () => {
      window.removeEventListener('hunianisme_data_changed', handleSync);
    };
  }, [paramSlug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
        <HeaderNav />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Properti Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Listing properti dengan tautan &quot;{decodeURIComponent(paramSlug || '')}&quot; mungkin telah dihapus, terjual, atau belum ditambahkan ke sistem.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/properti"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
            >
              Kembali ke Katalog Properti
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
            >
              Halaman Beranda
            </Link>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  const allImages = [property.imageUrl, ...(property.additionalImages || [])];
  const quickKpr = calculateKPR(property.price, kprDpPercent, kprInterest, kprTenorYears);

  const getWhatsappUrl = () => {
    const text = encodeURIComponent(
      `Halo ${property.agentName}, saya tertarik dengan properti "${property.title}" (${formatRupiah(property.price)}) di ${property.city}. Mohon info ketersediaan unit dan jadwal survei lokasi. Link: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    return `https://wa.me/${property.agentPhone || '6281234567890'}?text=${text}`;
  };

  // Related properties (same city or same type)
  const relatedProperties = allProperties
    .filter((p) => p.id !== property.id && (p.city === property.city || p.type === property.type))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <HeaderNav />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav className="flex items-center gap-2 text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <Link href="/properti" className="hover:text-blue-600 transition">Katalog Properti</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-xs">{property.title}</span>
          </nav>

          {/* Share Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600">Tautan Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Bagikan</span>
                </>
              )}
            </button>
            <Link
              href="/properti"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-bold transition"
            >
              <ArrowLeft size={14} />
              <span>Semua Listing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              {property.badge && (
                <span className="bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg">
                  {property.badge}
                </span>
              )}
              <span className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
                {property.type}
              </span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 size={13} />
                Status: {property.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <MapPin size={15} className="text-blue-600 shrink-0" />
              <span className="font-medium text-gray-700">{property.address}</span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Harga Penawaran
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
              {formatRupiah(property.price)}
            </div>
            {property.developer && (
              <span className="text-xs text-gray-500 mt-1 block">
                Developer: <strong className="text-gray-800">{property.developer}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Gallery & Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Gallery, Specs, Facilities, Description, KPR */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery Section */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="relative h-[340px] sm:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-900">
                <SafeImage
                  src={activeImage || property.imageUrl}
                  alt={property.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  referrerPolicy="no-referrer"
                  fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                />
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 pt-4 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-24 h-18 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        activeImage === img ? 'border-emerald-600 scale-102 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                        referrerPolicy="no-referrer"
                        fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Highlight Bar */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/60">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
                  <BedDouble size={16} />
                  Kamar Tidur
                </div>
                <div className="text-xl font-black text-gray-900">
                  {property.bedrooms > 0 ? `${property.bedrooms} KT` : '-'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/50">
                <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold mb-1">
                  <Bath size={16} />
                  Kamar Mandi
                </div>
                <div className="text-xl font-black text-gray-900">
                  {property.bathrooms > 0 ? `${property.bathrooms} KM` : '-'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/50">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-1">
                  <Maximize size={16} />
                  Luas Bangunan
                </div>
                <div className="text-xl font-black text-gray-900">
                  {property.buildingArea > 0 ? `${property.buildingArea} m²` : '-'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/50">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-1">
                  <Home size={16} />
                  Luas Tanah
                </div>
                <div className="text-xl font-black text-gray-900">
                  {property.surfaceArea > 0 ? `${property.surfaceArea} m²` : '-'}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-4">
                Deskripsi Lengkap Properti
              </h2>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Facilities Card */}
            {property.facilities && property.facilities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-4">
                  Fasilitas &amp; Keunggulan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {property.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-gray-800"
                    >
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Live KPR Calculator Card for This Property */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Calculator size={16} />
                    Kalkulator Simulasi KPR
                  </div>
                  <h2 className="text-xl font-black text-gray-900">
                    Estimasi Cicilan untuk {property.title}
                  </h2>
                </div>
                <Link
                  href="/simulasi-kpr"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Buka Kalkulator Penuh &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Inputs */}
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-gray-700 mb-1">
                      <span>Uang Muka (DP {kprDpPercent}%)</span>
                      <span className="text-blue-600">{formatRupiah(quickKpr.downPaymentAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={kprDpPercent}
                      onChange={(e) => setKprDpPercent(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-gray-700 mb-1">
                      <span>Jangka Waktu: {kprTenorYears} Tahun</span>
                      <span className="text-gray-500">{kprTenorYears * 12} bulan</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={5}
                      value={kprTenorYears}
                      onChange={(e) => setKprTenorYears(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-gray-700 mb-1">
                      <span>Suku Bunga Fixed: {kprInterest}%</span>
                      <span className="text-gray-500">per tahun</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      step={0.25}
                      value={kprInterest}
                      onChange={(e) => setKprInterest(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                    />
                  </div>
                </div>

                {/* Result Card */}
                <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-2xl p-6">
                  <span className="text-emerald-300 text-xs font-semibold block mb-1">
                    Estimasi Cicilan per Bulan
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white mb-2">
                    {formatRupiah(quickKpr.monthlyInstallment)}
                    <span className="text-xs font-normal text-emerald-200"> /bln</span>
                  </div>
                  <div className="text-[11px] text-emerald-200 space-y-1 pt-3 border-t border-white/20">
                    <div className="flex justify-between">
                      <span>Plafon Pinjaman:</span>
                      <strong className="text-white">{formatRupiah(quickKpr.loanAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Uang Muka:</span>
                      <strong className="text-white">{formatRupiah(quickKpr.downPaymentAmount)}</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Sticky Agent Card, Direct Contact, Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Agent Contact Card */}
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-gray-100 space-y-6">
              
              <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-700/20">
                  {property.agentName ? property.agentName.slice(0, 2).toUpperCase() : 'AG'}
                </div>
                <div>
                  <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Agen Properti Terverifikasi
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {property.agentName || 'Spesialis Hunianisme'}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Listing Resmi Pengembang
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={getWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition"
                >
                  <MessageSquare size={17} />
                  Hubungi Agen via WhatsApp
                </a>

                {property.agentPhone && (
                  <a
                    href={`tel:${property.agentPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold text-xs transition"
                  >
                    <Phone size={15} />
                    Telepon Langsung ({property.agentPhone})
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
                >
                  <Share2 size={15} />
                  {copied ? 'Tautan Berhasil Disalin!' : 'Bagikan Link Properti Ini'}
                </button>
              </div>

              {/* Security & Guarantees */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-gray-600">
                <div className="font-bold text-gray-900 mb-1">Jaminan Transaksi Hunianisme:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Tanpa Biaya Perantara / Calo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Pendampingan KPR Gratis hingga Akad</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Legalitas &amp; Sertifikat Terverifikasi</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Pilihan Serupa
                </span>
                <h3 className="text-2xl font-black text-gray-900">
                  Properti Lain di Sekitar {property.city}
                </h3>
              </div>
              <Link 
                href="/properti" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Lihat Semua Listing &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProperties.map((rel) => {
                const relSlug = getPropertySlug(rel);
                return (
                  <Link
                    key={rel.id}
                    href={`/properti/${relSlug}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={rel.imageUrl}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                      />
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {rel.city}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-lg font-black text-blue-600 mb-1">
                          {formatRupiah(rel.price)}
                        </div>
                        <h4 className="font-extrabold text-gray-900 group-hover:text-blue-600 transition line-clamp-1 text-sm mb-1">
                          {rel.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {rel.address}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <FooterNav />
    </div>
  );
}

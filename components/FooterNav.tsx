'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Building, Compass, Phone, Mail, MapPin, Calculator, BookOpen, Layers, Home } from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, isValidImageUrl } from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';

export default function FooterNav() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const sync = () => {
      setSettings(getSiteSettings());
    };
    sync();
    window.addEventListener('hunianisme_data_changed', sync);
    return () => window.removeEventListener('hunianisme_data_changed', sync);
  }, []);

  const cleanWhatsapp = (settings.contactWhatsapp || '6281234567890').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm py-16 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between gap-10 md:gap-8 lg:gap-14">
        
        {/* Kolom 1: Profil / Brand & Kontak */}
        <div className="w-full md:max-w-xs lg:max-w-sm space-y-4 shrink-0">
          <Link href="/" className="inline-flex items-center">
            {isValidImageUrl(settings.logoUrl) ? (
              <div className="relative h-12 w-52 sm:w-60 overflow-hidden">
                <SafeImage
                  src={settings.logoUrl}
                  alt={settings.brandName || 'Logo'}
                  fill
                  className="object-contain object-left"
                  sizes="240px"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <Building2 size={22} />
                </div>
                <span className="text-2xl font-black text-emerald-500 tracking-tight">
                  {settings.brandName || 'Hunianisme'}
                </span>
              </div>
            )}
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed text-justify">
            Hunianisme adalah website properti yang menghadirkan beragam pilihan rumah, ruko, apartemen, dan tanah, serta menyajikan berita dan artikel terbaru seputar dunia properti, perkembangan kawasan, dan tren hunian.
          </p>
          <div className="pt-2 flex flex-col gap-2.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <span>{settings.officeAddress || 'Jagakarsa, Jakarta Selatan'}</span>
            </div>
            {settings.contactWhatsapp && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-500 shrink-0" />
                <a 
                  href={`https://wa.me/${cleanWhatsapp}?text=Halo%20${encodeURIComponent(settings.brandName || 'Hunianisme')}%2C%20saya%20ingin%20konsultasi%20properti`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  WhatsApp: +{cleanWhatsapp}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-amber-500 shrink-0" />
              <a href={`mailto:${settings.contactEmail || 'januarpro901@gmail.com'}`} className="hover:text-white transition">
                {settings.contactEmail || 'januarpro901@gmail.com'}
              </a>
            </div>
          </div>
        </div>

        {/* Kolom Menu Sebelah Kanan (Kategori, Lokasi Populer, Fitur & Edukasi) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 md:pt-16">
          
          {/* Kolom 2: Kategori Properti (Tanpa Logo di Judul, Icon warna-warni) */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Kategori Properti
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/properti" className="hover:text-white transition flex items-center gap-2">
                  <Layers size={13} className="text-sky-400 shrink-0" />
                  <span>Semua Listing</span>
                </Link>
              </li>
              <li>
                <Link href="/properti?tipe=rumah" className="hover:text-white transition flex items-center gap-2">
                  <Home size={13} className="text-emerald-400 shrink-0" />
                  <span>Rumah</span>
                </Link>
              </li>
              <li>
                <Link href="/properti?tipe=apartemen" className="hover:text-white transition flex items-center gap-2">
                  <Building size={13} className="text-indigo-400 shrink-0" />
                  <span>Apartement</span>
                </Link>
              </li>
              <li>
                <Link href="/properti?tipe=ruko" className="hover:text-white transition flex items-center gap-2">
                  <Building2 size={13} className="text-amber-400 shrink-0" />
                  <span>Ruko</span>
                </Link>
              </li>
              <li>
                <Link href="/properti?tipe=tanah" className="hover:text-white transition flex items-center gap-2">
                  <Compass size={13} className="text-teal-400 shrink-0" />
                  <span>Tanah</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Lokasi Populer (Tanpa Logo, Tangerang saja) */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Lokasi Populer
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/properti?lokasi=Jakarta" className="hover:text-white transition block">
                  Properti di Jakarta
                </Link>
              </li>
              <li>
                <Link href="/properti?lokasi=Tangerang" className="hover:text-white transition block">
                  Properti di Tangerang
                </Link>
              </li>
              <li>
                <Link href="/properti?lokasi=Bekasi" className="hover:text-white transition block">
                  Properti di Bekasi
                </Link>
              </li>
              <li>
                <Link href="/properti?lokasi=Bogor" className="hover:text-white transition block">
                  Properti di Bogor
                </Link>
              </li>
              <li>
                <Link href="/properti?lokasi=Karawang" className="hover:text-white transition block">
                  Properti di Karawang
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Fitur & Edukasi (Tanpa Listing Terverifikasi, Ikon Berwarna) */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Fitur &amp; Edukasi
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/simulasi-kpr" className="hover:text-white transition flex items-center gap-1.5">
                  <Calculator size={14} className="text-amber-400 shrink-0" />
                  <span>Simulasi KPR</span>
                </Link>
              </li>
              <li>
                <Link href="/artikel" className="hover:text-white transition flex items-center gap-1.5">
                  <BookOpen size={14} className="text-sky-400 shrink-0" />
                  <span>Artikel &amp; Berita</span>
                </Link>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${cleanWhatsapp}?text=Halo%20${encodeURIComponent(settings.brandName || 'Hunianisme')}%2C%20saya%20ingin%20konsultasi%20properti`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <Phone size={14} className="text-emerald-400 shrink-0" />
                  <span>Konsultasi WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Baris Copyright Bawah (Tanpa teks 'Keamanan Data Terjamin · Transparan & Akurat') */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-xs text-slate-500">
        <Link
          href="/admin"
          className="text-slate-500 hover:text-slate-400 transition-colors select-none focus:outline-none"
          tabIndex={-1}
          aria-label={`${settings.brandName || 'Hunianisme'} Portal Properti`}
        >
          &copy; 2026 {settings.brandName || 'Hunianisme'} Portal Properti. Hak cipta dilindungi undang-undang.
        </Link>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Building2, Calculator, Menu, X, Home, BookOpen, 
  MapPin, Phone, Compass
} from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, isValidImageUrl, fetchServerDataAndSync } from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';


export default function HeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => {
      setSettings(getSiteSettings());
    };
    sync();
    // Fetch any updated server data (properties, articles, settings) on mount
    fetchServerDataAndSync();
    window.addEventListener('hunianisme_data_changed', sync);
    return () => window.removeEventListener('hunianisme_data_changed', sync);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const cleanWhatsapp = (settings.contactWhatsapp || '6281234567890').replace(/[^0-9]/g, '');

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              {isValidImageUrl(settings.logoUrl) ? (
                <div className="relative h-12 w-52 sm:w-64 max-h-12 overflow-hidden flex items-center group-hover:opacity-95 transition-opacity">
                  <SafeImage
                    src={settings.logoUrl}
                    alt={settings.brandName || 'Logo'}
                    fill
                    className="object-contain object-left"
                    sizes="260px"
                    priority
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span className="text-2xl font-black tracking-tight text-gray-900">
                      {settings.brandName || 'Hunianisme'}
                    </span>
                    <span className="block text-[10px] tracking-widest text-emerald-700 font-bold -mt-1 uppercase">
                      {settings.brandTagline || 'Cari & Temukan Hunian'}
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-600">
              <Link 
                href="/" 
                className={`transition hover:text-emerald-700 ${pathname === '/' ? 'text-emerald-700 font-bold' : ''}`}
              >
                Beranda
              </Link>
              <Link 
                href="/properti" 
                className={`transition hover:text-emerald-700 ${pathname === '/properti' || pathname.startsWith('/properti/') ? 'text-emerald-700 font-bold' : ''}`}
              >
                Semua Properti
              </Link>
              <Link 
                href="/properti?tipe=rumah" 
                className="hover:text-emerald-700 transition"
              >
                Rumah
              </Link>
              <Link 
                href="/properti?tipe=apartemen" 
                className="hover:text-emerald-700 transition"
              >
                Apartement
              </Link>
              <Link 
                href="/properti?tipe=ruko" 
                className="hover:text-emerald-700 transition"
              >
                Ruko
              </Link>
              <Link 
                href="/properti?tipe=tanah" 
                className="hover:text-emerald-700 transition"
              >
                Tanah
              </Link>
              <Link 
                href="/simulasi-kpr" 
                className={`transition hover:text-emerald-700 ${isActive('/simulasi-kpr') ? 'text-emerald-700 font-bold' : ''}`}
              >
                Simulasi KPR
              </Link>
              <Link 
                href="/artikel" 
                className={`transition hover:text-emerald-700 ${isActive('/artikel') ? 'text-emerald-700 font-bold' : ''}`}
              >
                Artikel &amp; Berita
              </Link>
            </nav>
            
            {/* Hamburger Button for Mobile */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 focus:outline-none transition border border-gray-200"
                aria-label="Buka Menu Navigasi"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center pb-5 border-b border-gray-100 mb-6">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                  {isValidImageUrl(settings.logoUrl) ? (
                    <div className="relative h-10 w-44 overflow-hidden flex items-center">
                      <SafeImage
                        src={settings.logoUrl}
                        alt={settings.brandName || 'Logo'}
                        fill
                        className="object-contain object-left"
                        sizes="180px"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0">
                        <Building2 size={18} />
                      </div>
                      <span className="font-extrabold text-xl text-gray-900">{settings.brandName || 'Hunianisme'}</span>
                    </div>
                  )}
                </Link>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
                  aria-label="Tutup Menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Home size={18} className="text-emerald-700" />
                  Beranda
                </Link>

                <Link 
                  href="/properti" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${pathname === '/properti' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Compass size={18} className="text-emerald-700" />
                  Katalog Semua Properti
                </Link>

                <div className="pt-2 pb-1 pl-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Kategori Properti
                </div>
                <Link 
                  href="/properti?tipe=rumah" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Rumah
                </Link>
                <Link 
                  href="/properti?tipe=apartemen" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Apartement
                </Link>
                <Link 
                  href="/properti?tipe=ruko" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Ruko
                </Link>
                <Link 
                  href="/properti?tipe=tanah" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Tanah
                </Link>

                <div className="pt-3 pb-1 pl-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Fitur &amp; Wawasan
                </div>
                <Link 
                  href="/simulasi-kpr" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/simulasi-kpr') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Calculator size={18} className="text-amber-500" />
                  Kalkulator Simulasi KPR
                </Link>
                <Link 
                  href="/artikel" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/artikel') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <BookOpen size={18} className="text-emerald-600" />
                  Artikel &amp; Edukasi
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <a 
                href={`https://wa.me/${cleanWhatsapp}?text=Halo%20${encodeURIComponent(settings.brandName || 'Hunianisme')}%2C%20saya%20ingin%20konsultasi%20mencari%20properti`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
              >
                <Phone size={16} />
                Hubungi Konsultan Properti
              </a>
              <p className="text-center text-xs text-gray-400 mt-3">
                {settings.brandName || 'Hunianisme'} &copy; 2026 Portal Properti
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

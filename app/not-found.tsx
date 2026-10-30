import React from 'react';
import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative inline-block">
            <span className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 select-none">
              404
            </span>
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl -z-10 rounded-full" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tautan yang Anda tuju keliru.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
            <Link
              href="/properti"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-medium text-sm transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              Jelajahi Properti
            </Link>
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
}

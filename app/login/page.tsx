'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Direct access to admin panel without password
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-5 animate-pulse">
        <Building2 size={32} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Mengarahkan ke Admin Panel...</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        Akses login dinonaktifkan. Anda langsung diarahkan ke Dashboard Admin tanpa perlu kata sandi.
      </p>
      <Link
        href="/admin"
        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
      >
        <span>Buka Admin Panel Sekarang</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

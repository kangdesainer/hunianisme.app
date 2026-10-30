'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { 
  Calculator, ChevronRight, ArrowRight, Phone, 
  PieChart, Info
} from 'lucide-react';
import { 
  formatRupiah, calculateKPR, getStoredProperties, INITIAL_PROPERTIES,
  getPropertySlug, DEFAULT_PROPERTY_IMAGE 
} from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import { PropertyListing } from '@/types/property';

export default function StandaloneKprPage() {
  const [propertyPrice, setPropertyPrice] = useState<number>(1500000000);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [tenorYears, setTenorYears] = useState<number>(15);
  const [interestRate, setInterestRate] = useState<number>(5.75);
  const [featuredProperties, setFeaturedProperties] = useState<PropertyListing[]>(() => INITIAL_PROPERTIES.slice(0, 3));

  useEffect(() => {
    const sync = () => {
      const all = getStoredProperties();
      setFeaturedProperties(all.slice(0, 3));
    };
    const timer = setTimeout(sync, 0);
    window.addEventListener('hunianisme_data_changed', sync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hunianisme_data_changed', sync);
    };
  }, []);

  const result = calculateKPR(propertyPrice, dpPercent, interestRate, tenorYears);

  // Biaya Awal Estimasi
  const bphtbTax = Math.max(0, Math.round((propertyPrice - 80000000) * 0.05));
  const notaryFee = Math.round(propertyPrice * 0.01);
  const bankProvision = Math.round(result.loanAmount * 0.01);
  const bankAdmin = 1500000;
  const insuranceFee = Math.round(result.loanAmount * 0.015);
  const totalUpfrontCost = result.downPaymentAmount + bphtbTax + notaryFee + bankProvision + bankAdmin + insuranceFee;

  // Minimum Income Recommendation (installment should be max 35% of monthly income)
  const minRecommendedIncome = Math.round(result.monthlyInstallment / 0.35);

  const presets = [
    { label: '500 Juta', value: 500000000 },
    { label: '850 Juta', value: 850000000 },
    { label: '1,5 Milyar', value: 1500000000 },
    { label: '2,5 Milyar', value: 2500000000 },
    { label: '4 Milyar', value: 4000000000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <HeaderNav />

      {/* Hero Header (Disamakan dengan halaman Berita & Listingan) */}
      <div className="bg-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition">Beranda</Link>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-white font-medium">Simulasi KPR</span>
          </nav>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              KALKULATOR SIMULASI KPR
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Hitung Simulasi Cicilan KPR Rumah Impian Anda
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Dapatkan estimasi angsuran per bulan, rincian biaya awal (DP, notaris, BPHTB, asuransi), serta rekomendasi penghasilan minimum secara instan sebelum mengajukan ke bank.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Calculator Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="text-emerald-700" size={22} />
              Parameter Pengajuan Kredit
            </h2>

            {/* Price Input & Presets */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Harga Properti
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  min={100000000}
                  step={50000000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Math.max(10000000, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Terbilang: <strong className="text-emerald-700">{formatRupiah(propertyPrice)}</strong></span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mt-3">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPropertyPrice(p.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      propertyPrice === p.value 
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-emerald-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DP Input Slider */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Uang Muka (DP): <span className="text-emerald-700">{dpPercent}%</span>
                </label>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {formatRupiah(result.downPaymentAmount)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Tenor Selection */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Jangka Waktu (Tenor): <span className="text-emerald-700">{tenorYears} Tahun</span>
                </label>
                <span className="text-xs text-gray-500 font-medium">
                  {tenorYears * 12} kali cicilan bulanan
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[5, 10, 15, 20, 25, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenorYears(yr)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                      tenorYears === yr
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    {yr} Tahun
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Suku Bunga Fixed: <span className="text-emerald-700">{interestRate}% per tahun</span>
                </label>
                <span className="text-xs text-gray-500">Estimasi promo bank saat ini</span>
              </div>
              <input
                type="range"
                min={2.5}
                max={12}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
                <span>2.5%<span className="hidden sm:inline"> (Promo)</span></span>
                <span>5.5%<span className="hidden sm:inline"> (Rata-rata)</span></span>
                <span>8.0%</span>
                <span>12.0%<span className="hidden sm:inline"> (Floating)</span></span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
              <Info size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <strong>Tips KPR Hunianisme:</strong> Idealnya cicilan KPR maks 30% sampai 35% dari total penghasilan perbulan.
              </div>
            </div>

          </div>

          {/* Right Card: Result Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/30">
              <div className="flex items-center justify-between text-emerald-300 text-xs uppercase font-bold tracking-wider mb-2">
                <span>Estimasi Angsuran Bulanan</span>
                <span className="bg-emerald-800/60 border border-emerald-700/50 px-2 py-0.5 rounded text-[11px] text-emerald-200">Anuitas</span>
              </div>
              
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {formatRupiah(result.monthlyInstallment)}
                <span className="text-sm font-semibold text-emerald-300 ml-1">/bulan</span>
              </div>

              <p className="text-xs text-emerald-100/90 mb-6 leading-relaxed">
                Berdasarkan plafon kredit <strong>{formatRupiah(result.loanAmount)}</strong> selama {tenorYears} tahun dengan suku bunga {interestRate}%.
              </p>

              {/* Metrics (Tanpa garis pembatas) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
                  <div className="text-emerald-200 mb-1">Plafon Pinjaman Pokok</div>
                  <div className="font-extrabold text-sm text-white">{formatRupiah(result.loanAmount)}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
                  <div className="text-emerald-200 mb-1">Rekomendasi Gaji Min.</div>
                  <div className="font-extrabold text-sm text-emerald-300">{formatRupiah(minRecommendedIncome)}/bln</div>
                </div>
              </div>

              {/* Consultation CTA (Tanpa garis pembatas) */}
              <div className="mt-6">
                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    `Halo Hunianisme, saya ingin konsultasi KPR untuk properti seharga ${formatRupiah(propertyPrice)} dengan simulasi cicilan ${formatRupiah(result.monthlyInstallment)}/bulan.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md transition"
                >
                  <Phone size={16} />
                  Konsultasi Via Whatsapp
                </a>
              </div>
            </div>

            {/* Upfront Costs Breakdown Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-gray-100">
              <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                <PieChart size={18} className="text-emerald-700" />
                Estimasi Biaya Awal Pembelian
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Uang Muka (DP {dpPercent}%)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(result.downPaymentAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Pajak Pembeli (BPHTB 5%)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(bphtbTax)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Biaya Akta Jual Beli &amp; Notaris (~1%)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(notaryFee)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Provisi Bank (~1%)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(bankProvision)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Asuransi Jiwa &amp; Kebakaran (~1.5%)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(insuranceFee)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Biaya Administrasi Bank</span>
                  <span className="font-bold text-gray-900">{formatRupiah(bankAdmin)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 text-sm font-extrabold text-emerald-950 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span>Total Biaya Awal Yang Disiapkan</span>
                  <span className="text-emerald-700">{formatRupiah(totalUpfrontCost)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Featured Matching Properties */}
        {featuredProperties.length > 0 && (
          <section className="mt-14">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Rekomendasi Hunian
                </span>
                <h3 className="text-2xl font-black text-gray-900">
                  Properti Pilihan Siap KPR
                </h3>
              </div>
              <Link 
                href="/properti" 
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Lihat Semua Listing
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProperties.map((prop) => {
                const slug = getPropertySlug(prop);
                return (
                  <Link
                    key={prop.id}
                    href={`/properti/${slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={prop.imageUrl}
                        alt={prop.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                      />
                      <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {prop.city}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-1 text-base mb-1">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                          {prop.address}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase">Harga</span>
                          <span className="font-extrabold text-emerald-700 text-sm">
                            {formatRupiah(prop.price)}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Lihat Detail
                          <ArrowRight size={12} className="text-emerald-700" />
                        </span>
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

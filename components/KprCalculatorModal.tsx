'use client';

import React, { useState, useEffect } from 'react';
import { X, Calculator, DollarSign, Calendar, Percent, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatRupiah, calculateKPR } from '@/lib/propertyStore';
import { PropertyListing } from '@/types/property';

interface KprCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProperty?: PropertyListing | null;
}

export default function KprCalculatorModal({
  isOpen,
  onClose,
  initialProperty,
}: KprCalculatorModalProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(1500000000);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [tenorYears, setTenorYears] = useState<number>(15);

  useEffect(() => {
    if (initialProperty) {
      const timer = setTimeout(() => {
        setPropertyPrice(initialProperty.price);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialProperty]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const result = calculateKPR(propertyPrice, dpPercent, interestRate, tenorYears);
  const totalPayment = result.monthlyInstallment * (tenorYears * 12);
  const totalInterest = Math.max(0, totalPayment - result.loanAmount);
  const minRecommendedIncome = Math.round(result.monthlyInstallment * 3);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Simulasi KPR Hunianisme</h2>
              <p className="text-xs text-blue-100">Kalkulasi estimasi cicilan bulanan & uang muka rumah</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {initialProperty && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-blue-900 font-semibold truncate mr-2">
                Simulasi untuk: {initialProperty.title}
              </span>
              <span className="font-bold text-blue-700 whitespace-nowrap">
                {formatRupiah(initialProperty.price)}
              </span>
            </div>
          )}

          {/* Input Controls */}
          <div className="space-y-4">
            {/* Harga Properti */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Harga Properti (Rp)
                </label>
                <span className="text-sm font-bold text-blue-700">
                  {formatRupiah(propertyPrice)}
                </span>
              </div>
              <input
                type="number"
                min={100000000}
                max={20000000000}
                step={50000000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Math.max(10000000, Number(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              />
              <div className="flex gap-2 mt-2">
                {[500000000, 1000000000, 1500000000, 2500000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setPropertyPrice(amt)}
                    type="button"
                    className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition font-medium"
                  >
                    {amt >= 1000000000 ? `${amt / 1000000000}M` : `${amt / 1000000}Jt`}
                  </button>
                ))}
              </div>
            </div>

            {/* Uang Muka (DP) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Uang Muka (DP): {dpPercent}%
                </label>
                <span className="text-xs font-semibold text-gray-600">
                  {formatRupiah(result.downPaymentAmount)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[5, 10, 20, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDpPercent(pct)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      dpPercent === pct
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Tenor & Bunga Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Tenor Pinjaman ({tenorYears} Tahun)
                </label>
                <select
                  value={tenorYears}
                  onChange={(e) => setTenorYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                >
                  <option value={5}>5 Tahun (60 Bulan)</option>
                  <option value={10}>10 Tahun (120 Bulan)</option>
                  <option value={15}>15 Tahun (180 Bulan)</option>
                  <option value={20}>20 Tahun (240 Bulan)</option>
                  <option value={25}>25 Tahun (300 Bulan)</option>
                  <option value={30}>30 Tahun (360 Bulan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Suku Bunga Fixed: {interestRate}% / thn
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="20"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold">
                Estimasi Cicilan per Bulan
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1">
                {formatRupiah(result.monthlyInstallment)}
                <span className="text-sm font-normal text-gray-300"> / bulan</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-700 text-xs">
              <div>
                <div className="text-gray-400">Plafon Pinjaman</div>
                <div className="text-sm font-bold text-white mt-0.5">{formatRupiah(result.loanAmount)}</div>
              </div>
              <div>
                <div className="text-gray-400">Total Bunga (Est.)</div>
                <div className="text-sm font-bold text-white mt-0.5">{formatRupiah(totalInterest)}</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-gray-400">Saran Min. Gaji</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{formatRupiah(minRecommendedIncome)}/bln</div>
              </div>
            </div>
          </div>

          {/* Advice note */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-xl text-xs text-blue-900 leading-relaxed border border-blue-100">
            <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Catatan:</strong> Perhitungan simulasi bersifat estimasi acuan umum suku bunga anuitas. Suku bunga riil, biaya provisi (1%), asuransi, dan approval bergantung pada analisis pihak bank mitra penyedia KPR.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-semibold text-sm transition"
          >
            Tutup
          </button>
          <a
            href={`https://wa.me/6281234567890?text=${encodeURIComponent(
              `Halo Admin Hunianisme, saya ingin konsultasi KPR untuk properti seharga ${formatRupiah(propertyPrice)} dengan DP ${dpPercent}% dan tenor ${tenorYears} tahun.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95"
          >
            Konsultasi KPR Gratis
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

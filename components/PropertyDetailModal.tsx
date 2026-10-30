'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, MapPin, BedDouble, Bath, Maximize, Home, CheckCircle2, 
  Phone, MessageSquare, Calculator, Building, Tag, Share2
} from 'lucide-react';
import { PropertyListing } from '@/types/property';
import { formatRupiah, calculateKPR, DEFAULT_PROPERTY_IMAGE } from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';

interface PropertyDetailModalProps {
  property: PropertyListing | null;
  onClose: () => void;
  onOpenKprWithProperty?: (property: PropertyListing) => void;
}

export default function PropertyDetailModal({
  property,
  onClose,
  onOpenKprWithProperty,
}: PropertyDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!property) return null;

  const currentImage = selectedImage || property.imageUrl;
  const allImages = [property.imageUrl, ...(property.additionalImages || [])];

  // Quick KPR calculation with 20% DP, 15 years, 6% interest
  const quickKpr = calculateKPR(property.price, 20, 6, 15);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsappUrl = () => {
    const text = encodeURIComponent(
      `Halo ${property.agentName}, saya tertarik dengan properti "${property.title}" (${formatRupiah(property.price)}) di ${property.city}. Bisakah berikan informasi detail dan jadwal survei lokasi?`
    );
    return `https://wa.me/${property.agentPhone || '6281234567890'}?text=${text}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <Building size={13} />
              {property.type.toUpperCase()}
            </span>
            {property.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                {property.badge}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              property.status === 'tersedia' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {property.status === 'tersedia' ? '● Tersedia' : '● Terjual'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"
              title="Salin tautan"
            >
              <Share2 size={18} />
            </button>
            {copied && <span className="text-xs text-emerald-600 font-medium">Tersalin!</span>}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6">
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
              <SafeImage
                src={currentImage}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
                referrerPolicy="no-referrer"
                priority
                fallbackSrc={DEFAULT_PROPERTY_IMAGE}
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                {property.city}
              </div>
            </div>

            {/* Thumbnail selector */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                      currentImage === img ? 'border-blue-600 scale-95 ring-2 ring-blue-300' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${property.title} foto ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      referrerPolicy="no-referrer"
                      fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600 text-sm gap-1.5">
                <MapPin size={16} className="text-red-500 shrink-0" />
                <span>{property.address}</span>
              </div>
              {property.developer && (
                <div className="text-xs text-gray-500">
                  Developer: <span className="font-semibold text-gray-700">{property.developer}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl md:text-right shrink-0">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-0.5">Harga Penawaran</div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700">
                {formatRupiah(property.price)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Est. Cicilan: <span className="font-semibold text-gray-800">{formatRupiah(quickKpr.monthlyInstallment)}</span>/bln
              </div>
            </div>
          </div>

          {/* Property Specifications Grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Spesifikasi Properti</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                  <BedDouble size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Kamar Tidur</div>
                  <div className="text-base font-bold text-gray-800">
                    {property.bedrooms > 0 ? `${property.bedrooms} Kamar` : '-'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Bath size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Kamar Mandi</div>
                  <div className="text-base font-bold text-gray-800">
                    {property.bathrooms > 0 ? `${property.bathrooms} Ruang` : '-'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Maximize size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Luas Bangunan</div>
                  <div className="text-base font-bold text-gray-800">
                    {property.buildingArea > 0 ? `${property.buildingArea} m²` : '-'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Home size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Luas Tanah</div>
                  <div className="text-base font-bold text-gray-800">
                    {property.surfaceArea > 0 ? `${property.surfaceArea} m²` : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          {property.facilities && property.facilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Fasilitas Utama</h3>
              <div className="flex flex-wrap gap-2">
                {property.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Deskripsi Properti</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {property.description}
            </p>
          </div>

          {/* Interactive KPR Calculator Callout */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                <Calculator size={15} />
                Simulasi Angsuran KPR
              </div>
              <h4 className="text-lg font-bold">Mulai dari {formatRupiah(quickKpr.monthlyInstallment)} / bulan</h4>
              <p className="text-xs text-blue-100">Asumsi DP 20% dengan tenor 15 tahun suku bunga 6.0%</p>
            </div>
            {onOpenKprWithProperty && (
              <button
                onClick={() => {
                  onClose();
                  onOpenKprWithProperty(property);
                }}
                className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap shadow-sm transition active:scale-95"
              >
                Hitung KPR Lengkap
              </button>
            )}
          </div>

          {/* Agent Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {property.agentName.charAt(0)}
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Agen Hunianisme Resmi</div>
                <div className="text-lg font-bold text-gray-900">{property.agentName}</div>
                <div className="text-xs text-gray-600 mt-0.5">Spesialis Area {property.city} & Sekitarnya</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={getWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl text-sm shadow-sm transition active:scale-95"
              >
                <MessageSquare size={16} />
                WhatsApp Agen
              </a>
              <a
                href={`tel:${property.agentPhone || '6281234567890'}`}
                className="p-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl transition shadow-xs"
                title="Telepon Agen"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

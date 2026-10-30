'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { 
  BookOpen, Search, ChevronRight, Calendar, User, 
  ArrowRight, Tag, Sparkles, X, Clock
} from 'lucide-react';
import { getStoredArticles, INITIAL_ARTICLES, getArticleSlug, DEFAULT_ARTICLE_IMAGE } from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import { Article } from '@/types/property';

function ArticleCatalogContent() {
  const searchParams = useSearchParams();
  const urlCat = searchParams.get('kategori');

  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [keyword, setKeyword] = useState<string>('');
  const [userCategory, setUserCategory] = useState<string | null>(null);

  const selectedCategory = userCategory ?? (urlCat || 'all');
  const setSelectedCategory = (cat: string) => setUserCategory(cat);

  useEffect(() => {
    const sync = () => {
      setArticles(getStoredArticles());
    };
    sync();
    window.addEventListener('hunianisme_data_changed', sync);
    return () => {
      window.removeEventListener('hunianisme_data_changed', sync);
    };
  }, []);

  // Categories list
  const categories = useMemo(() => {
    const predefined = [
      "What's New",
      "Area Explorer",
      "Project Radar",
      "Keys to Know",
      "Property Insights",
    ];
    const extra = articles
      .map((a) => a.category)
      .filter((c) => Boolean(c) && !predefined.includes(c));
    return Array.from(new Set([...predefined, ...extra]));
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchExcerpt = art.excerpt.toLowerCase().includes(q);
        const matchCat = art.category.toLowerCase().includes(q);
        const matchTags = art.tags ? art.tags.some((t) => t.toLowerCase().includes(q)) : false;
        if (!matchTitle && !matchExcerpt && !matchCat && !matchTags) return false;
      }

      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [articles, keyword, selectedCategory]);

  const featured = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

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
            <span className="text-white font-medium">Artikel &amp; Edukasi Properti</span>
          </nav>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              Wawasan &amp; Panduan Praktis
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pusat Edukasi, Tips KPR &amp; Berita Properti
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
              Panduan lengkap membeli rumah pertama, strategi KPR, kiat memeriksa legalitas sertifikat (SHM/SHGB), serta analisa tren pasar properti di Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-gray-100 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="w-full md:w-96 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari artikel, topik, atau kata kunci..."
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

            {/* Category Segmented Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua Topik
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tidak Ada Artikel yang Ditemukan
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {articles.length === 0
                ? 'Belum ada artikel yang diterbitkan. Anda dapat menambahkan artikel baru dari portal admin.'
                : 'Coba ubah kata kunci pencarian atau pilih kategori topik yang lain.'}
            </p>
            {(keyword || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setKeyword('');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition"
              >
                Reset Filter Topik
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10 pb-16">
            
            {/* Featured Article Card */}
            {featured && (
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[300px] bg-slate-900">
                  <SafeImage
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                  />
                  <div className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md">
                    Artikel Pilihan
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mb-2">
                      <span>{featured.category}</span>
                      <span>&middot;</span>
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        {featured.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                      <Link 
                        href={`/artikel/${getArticleSlug(featured)}`}
                        className="hover:text-emerald-700 transition"
                      >
                        {featured.title}
                      </Link>
                    </h2>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                      {featured.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {featured.author.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{featured.author}</span>
                        <span className="text-[11px] text-gray-400">{featured.publishedAt}</span>
                      </div>
                    </div>

                    <Link
                      href={`/artikel/${getArticleSlug(featured)}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition"
                    >
                      Baca Selengkapnya
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grid for Remaining Articles */}
            {regularArticles.length > 0 && (
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-6">
                  Artikel &amp; Panduan Terkini
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {regularArticles.map((art) => {
                    const slug = getArticleSlug(art);
                    return (
                      <Link
                        key={art.id}
                        href={`/artikel/${slug}`}
                        className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                      >
                        <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                          <SafeImage
                            src={art.imageUrl}
                            alt={art.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                            {art.category}
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mb-2">
                              <span>{art.publishedAt}</span>
                              <span>&middot;</span>
                              <span>{art.readTime}</span>
                            </div>

                            <h4 className="text-base font-extrabold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 mb-2 leading-snug">
                              {art.title}
                            </h4>

                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                              {art.excerpt}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-700">{art.author}</span>
                            <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Baca
                              <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      <FooterNav />
    </div>
  );
}

export default function ArticleCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Memuat Direktori Artikel...</p>
        </div>
      </div>
    }>
      <ArticleCatalogContent />
    </Suspense>
  );
}

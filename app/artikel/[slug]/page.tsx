'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import HeaderNav from '@/components/HeaderNav';
import FooterNav from '@/components/FooterNav';
import { 
  BookOpen, ChevronRight, Calendar, User, Clock, 
  Share2, Check, ArrowLeft, ArrowRight, Tag, Sparkles, 
  Calculator, Phone, Building2
} from 'lucide-react';
import { 
  getStoredArticles, INITIAL_ARTICLES, getArticleBySlugOrId, getArticleSlug, DEFAULT_ARTICLE_IMAGE,
  fetchServerDataAndSync
} from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import ArticleBodyRenderer from '@/components/ArticleBodyRenderer';
import { Article } from '@/types/property';

export default function DynamicArticleDetailPage() {
  const params = useParams();
  const rawParamSlug = params?.slug;
  const paramSlug = typeof rawParamSlug === 'string' ? rawParamSlug : (Array.isArray(rawParamSlug) ? rawParamSlug[0] : '');

  const [allArticles, setAllArticles] = useState<Article[]>(() => {
    if (typeof window === 'undefined') return [];
    return getStoredArticles();
  });
  const [article, setArticle] = useState<Article | null>(() => {
    if (typeof window === 'undefined') return null;
    const pathSlug = window.location.pathname.split('/').filter(Boolean).pop() || '';
    return getArticleBySlugOrId(paramSlug || pathSlug);
  });
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchServerDataAndSync().then((data) => {
      if (data?.articles && data.articles.length > 0) {
        setAllArticles(data.articles);
        const pathSlug = typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean).pop() || '') : '';
        const activeSlug = paramSlug || pathSlug;
        if (activeSlug) {
          const found = getArticleBySlugOrId(activeSlug, data.articles);
          if (found) setArticle(found);
        }
      }
    });

    const handleSync = () => {
      const pathSlug = typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean).pop() || '') : '';
      const activeSlug = paramSlug || pathSlug;
      const list = getStoredArticles();
      setAllArticles(list);
      if (activeSlug) {
        setArticle(getArticleBySlugOrId(activeSlug, list));
      }
    };

    handleSync();
    window.addEventListener('hunianisme_data_changed', handleSync);
    return () => {
      window.removeEventListener('hunianisme_data_changed', handleSync);
    };
  }, [paramSlug]);

  // Hidden SEO Optimization (Meta tags, Open Graph & Keywords - Read by Googlebot)
  useEffect(() => {
    if (article && typeof window !== 'undefined') {
      const pageTitle = article.metaTitle ? `${article.metaTitle} | Hunianisme` : `${article.title} | Hunianisme`;
      document.title = pageTitle;

      const setMetaTag = (name: string, content: string, isProperty = false) => {
        const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement('meta');
          if (isProperty) tag.setAttribute('property', name);
          else tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      const desc = article.metaDescription || article.excerpt || article.title;
      const kw = article.focusKeywords || (article.tags && article.tags.join(', ')) || '';

      setMetaTag('description', desc);
      setMetaTag('keywords', kw);
      setMetaTag('og:title', article.metaTitle || article.title, true);
      setMetaTag('og:description', desc, true);
      setMetaTag('og:image', article.imageUrl, true);
      setMetaTag('og:type', 'article', true);
      setMetaTag('twitter:card', 'summary_large_image');
      setMetaTag('twitter:title', article.metaTitle || article.title);
      setMetaTag('twitter:description', desc);
      setMetaTag('twitter:image', article.imageUrl);
    }
  }, [article]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
        <HeaderNav />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Artikel Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Artikel dengan rute &quot;{decodeURIComponent(paramSlug || '')}&quot; mungkin telah diperbarui atau dipindahkan.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/artikel"
              className="px-6 py-3 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition"
            >
              Kembali ke Daftar Artikel
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

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <HeaderNav />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav className="flex items-center gap-2 text-gray-500">
            <Link href="/" className="hover:text-emerald-700 transition">Beranda</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <Link href="/artikel" className="hover:text-emerald-700 transition">Artikel &amp; Edukasi</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-xs">{article.category}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600">Link Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Bagikan</span>
                </>
              )}
            </button>
            <Link
              href="/artikel"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 font-bold transition"
            >
              <ArrowLeft size={14} />
              <span>Semua Artikel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            <span className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">{article.category}</span>
            <span>&middot;</span>
            <span className="text-gray-400 font-medium flex items-center gap-1 normal-case tracking-normal">
              <Clock size={13} />
              {article.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author & Date Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {article.author.slice(0, 1)}
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-sm">{article.author}</div>
                <div className="text-gray-500">{article.authorRole || 'Property Specialist'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <Calendar size={14} />
              <span>Diterbitkan: {article.publishedAt}</span>
            </div>
          </div>
        </header>

        {/* Hidden SEO Structured Data (JSON-LD) - Digunakan Google untuk Rich Snippet Pencarian */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: article.metaTitle || article.title,
              description: article.metaDescription || article.excerpt,
              image: [article.imageUrl],
              datePublished: article.publishedAt,
              dateModified: article.publishedAt,
              author: [
                {
                  '@type': 'Person',
                  name: article.author || 'Admin Hunianisme',
                  jobTitle: article.authorRole || 'Editor Properti',
                },
              ],
              publisher: {
                '@type': 'Organization',
                name: 'Hunianisme',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://res.cloudinary.com/drtx7dnvs/image/upload/v1792641233/lmhgorgs0xlyvdlydtt4.png',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': typeof window !== 'undefined' ? window.location.href : '',
              },
              keywords: article.focusKeywords || (article.tags && article.tags.join(', ')) || '',
            }),
          }}
        />

        {/* Hero Image & Excerpt sebagai Caption Gambar Elegan */}
        <figure className="mb-8">
          <div className="relative w-full aspect-video sm:aspect-[16/9] max-h-[500px] rounded-3xl overflow-hidden shadow-md bg-slate-900">
            <SafeImage
              src={article.imageUrl}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              referrerPolicy="no-referrer"
              fallbackSrc={DEFAULT_ARTICLE_IMAGE}
            />
          </div>
          {article.excerpt && (
            <figcaption className="text-xs sm:text-sm text-slate-500 italic text-center mt-3 px-4 leading-relaxed">
              &ldquo;{article.excerpt}&rdquo;
            </figcaption>
          )}
        </figure>

        {/* Article Body Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 mb-12">
          <ArticleBodyRenderer content={article.content} className="prose prose-slate max-w-none text-gray-700" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-400 flex items-center gap-1 mr-1">
                <Tag size={13} />
                Topik Terkait:
              </span>
              {article.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA Banner for KPR & Properties */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
              <Calculator size={14} className="text-amber-400" />
              Langkah Selanjutnya
            </div>
            <h3 className="text-2xl font-black text-white">
              Siap Memulai Perjalanan Membeli Rumah?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg">
              Gunakan kalkulator simulasi KPR interaktif kami atau telusuri langsung ratusan listing properti pilihan yang sesuai budget Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/simulasi-kpr"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Hitung Cicilan KPR
            </Link>
            <Link
              href="/properti"
              className="px-5 py-3 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs shadow-md transition"
            >
              Lihat Katalog Properti
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-8 border-t border-gray-200">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Edukasi Lainnya
                </span>
                <h3 className="text-2xl font-black text-gray-900">
                  Bacaan Terkait Pilihan
                </h3>
              </div>
              <Link
                href="/artikel"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => {
                const relSlug = getArticleSlug(rel);
                return (
                  <Link
                    key={rel.id}
                    href={`/artikel/${relSlug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={rel.imageUrl}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {rel.category}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h4 className="font-extrabold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-sm leading-snug mb-2">
                        {rel.title}
                      </h4>
                      <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
                        <span>{rel.publishedAt}</span>
                        <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                          Baca &rarr;
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

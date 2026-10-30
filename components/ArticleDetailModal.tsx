'use client';

import React from 'react';
import Image from 'next/image';
import { X, Calendar, Clock, User, Share2, Bookmark, Check } from 'lucide-react';
import { Article } from '@/types/property';
import { DEFAULT_ARTICLE_IMAGE } from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import ArticleBodyRenderer from '@/components/ArticleBodyRenderer';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
}

export default function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            {article.category}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition flex items-center gap-1.5 text-xs"
              title="Bagikan artikel"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-gray-500 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {article.author.charAt(0)}
              </div>
              <div>
                <div>{article.author}</div>
                <div className="text-[11px] text-gray-400 font-normal">{article.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400 ml-auto sm:ml-0">
              <Calendar size={14} />
              <span>{article.publishedAt}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={14} />
              <span>{article.readTime}</span>
            </div>
          </div>

          {/* Feature Image */}
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            <SafeImage
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
              referrerPolicy="no-referrer"
              fallbackSrc={DEFAULT_ARTICLE_IMAGE}
            />
          </div>

          {/* Excerpt */}
          <div className="p-4 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl italic text-gray-700 text-sm sm:text-base leading-relaxed">
            &ldquo;{article.excerpt}&rdquo;
          </div>

          {/* Main Content */}
          <ArticleBodyRenderer content={article.content} className="prose prose-gray max-w-none text-gray-800 text-sm sm:text-base" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Topik:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full font-medium transition cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

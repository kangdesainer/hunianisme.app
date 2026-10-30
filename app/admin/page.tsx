'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Building2, Home, Newspaper, LayoutDashboard, PlusCircle, Trash2, 
  Edit3, ExternalLink, LogOut, Search, Filter, CheckCircle2, 
  AlertCircle, X, MapPin, BedDouble, Bath, Maximize, Shield, 
  Sparkles, RefreshCw, Eye, ArrowUpRight, DollarSign, Tag, Check, Download, Upload,
  Settings, Phone, Mail, Globe, Image as ImageIcon, Clock,
  Bold, Italic, Link2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronDown, ChevronUp
} from 'lucide-react';
import ArticleBodyRenderer from '@/components/ArticleBodyRenderer';
import { 
  PropertyListing, Article, PropertyType 
} from '@/types/property';
import { 
  getStoredProperties, saveProperties, 
  getStoredArticles, saveArticles, 
  isAdminLoggedIn, setAdminLogin, getAdminUser, 
  formatRupiah, resetAllDataToDefault, clearAllDemoSamples,
  getSiteSettings, saveSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS,
  slugify, getPropertySlug, getArticleSlug,
  INITIAL_PROPERTIES, INITIAL_ARTICLES,
  isValidImageUrl, DEFAULT_PROPERTY_IMAGE, DEFAULT_ARTICLE_IMAGE,
  syncDataToServer, fetchServerDataAndSync
} from '@/lib/propertyStore';
import SafeImage from '@/components/SafeImage';
import PropertyDetailModal from '@/components/PropertyDetailModal';
import ArticleDetailModal from '@/components/ArticleDetailModal';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'articles' | 'settings'>('dashboard');

  // Site Settings state
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Data states
  const [properties, setProperties] = useState<PropertyListing[]>(() => 
    typeof window !== 'undefined' ? getStoredProperties() : INITIAL_PROPERTIES
  );
  const [articles, setArticles] = useState<Article[]>(() => 
    typeof window !== 'undefined' ? getStoredArticles() : INITIAL_ARTICLES
  );

  // Search & Filter
  const [propSearch, setPropSearch] = useState('');
  const [propTypeFilter, setPropTypeFilter] = useState<string>('all');
  const [propCityFilter, setPropCityFilter] = useState<string>('all');
  const [artSearch, setArtSearch] = useState('');
  const [artCategoryFilter, setArtCategoryFilter] = useState<string>('all');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyListing | null>(null);

  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [previewProperty, setPreviewProperty] = useState<PropertyListing | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'property' | 'article'; id: string; title: string } | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Tersimpan di sistem');

  // Form states for Property (bersih murni tanpa data template)
  const [propForm, setPropForm] = useState({
    title: '',
    type: 'rumah' as PropertyType,
    price: 0,
    city: 'Jakarta',
    address: '',
    developer: '',
    bedrooms: 0,
    bathrooms: 0,
    buildingArea: 0,
    surfaceArea: 0,
    imageUrl: '',
    description: '',
    facilitiesText: '',
    badge: '',
    status: 'tersedia' as 'tersedia' | 'terjual' | 'booking',
    agentName: '',
    agentPhone: '',
  });

  // Form states for Article (bersih murni tanpa data template)
  const [artForm, setArtForm] = useState({
    title: '',
    category: "What's New",
    author: '',
    authorRole: '',
    readTime: '',
    imageUrl: '',
    excerpt: '',
    content: '',
    tagsText: '',
    metaTitle: '',
    metaDescription: '',
    focusKeywords: '',
  });

  const [showSeoAccordion, setShowSeoAccordion] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Article Rich Editor state
  const [contentTab, setContentTab] = useState<'write' | 'preview'>('write');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const contentTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (tagOpen: string, tagClose: string, defaultText: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = artForm.content || '';
    const selectedText = text.substring(start, end);
    const replacement = selectedText ? `${tagOpen}${selectedText}${tagClose}` : `${tagOpen}${defaultText}${tagClose}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setArtForm({ ...artForm, content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + (selectedText.length || defaultText.length));
    }, 0);
  };

  const handleOpenLinkModal = () => {
    const textarea = contentTextareaRef.current;
    const selected = textarea && textarea.selectionStart !== textarea.selectionEnd 
      ? (artForm.content || '').substring(textarea.selectionStart, textarea.selectionEnd) 
      : '';
    setLinkText(selected);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      showToast('Harap masukkan alamat URL link');
      return;
    }
    const trimmedUrl = linkUrl.trim();
    const finalUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('/') || trimmedUrl.startsWith('tel:') || trimmedUrl.startsWith('mailto:') 
      ? trimmedUrl 
      : `https://${trimmedUrl}`;
    const display = linkText.trim() || finalUrl;
    const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-semibold">${display}</a>`;

    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = artForm.content || '';
      const newContent = text.substring(0, start) + linkHtml + text.substring(end);
      setArtForm({ ...artForm, content: newContent });
    } else {
      setArtForm({ ...artForm, content: (artForm.content || '') + ' ' + linkHtml });
    }
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const currentProps = getStoredProperties();
      const currentArts = getStoredArticles();
      const currentSettings = getSiteSettings();
      setProperties(currentProps);
      setArticles(currentArts);
      setSiteSettingsForm(currentSettings);

      // Auto-sync current data to server so public domain https://hunianisme.ai.studio/ is immediately up to date
      syncDataToServer({
        properties: currentProps,
        articles: currentArts,
        settings: currentSettings,
      }).then((ok) => {
        if (ok) {
          const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(`Live pk ${timeStr}`);
        }
      });
    }, 0);

    const handleDataChange = () => {
      setProperties(getStoredProperties());
      setArticles(getStoredArticles());
      setSiteSettingsForm(getSiteSettings());
    };

    window.addEventListener('hunianisme_data_changed', handleDataChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hunianisme_data_changed', handleDataChange);
    };
  }, []);

  const handleBackToWebsite = () => {
    router.push('/');
  };

  // Property Actions
  const handleOpenAddProperty = () => {
    setEditingProperty(null);
    setPropForm({
      title: '',
      type: 'rumah',
      price: 0,
      city: 'Jakarta',
      address: '',
      developer: '',
      bedrooms: 0,
      bathrooms: 0,
      buildingArea: 0,
      surfaceArea: 0,
      imageUrl: '',
      description: '',
      facilitiesText: '',
      badge: '',
      status: 'tersedia',
      agentName: '',
      agentPhone: '',
    });
    setShowPropertyModal(true);
  };

  const handleOpenEditProperty = (prop: PropertyListing) => {
    setEditingProperty(prop);
    setPropForm({
      title: prop.title,
      type: prop.type,
      price: prop.price,
      city: prop.city,
      address: prop.address,
      developer: prop.developer || '',
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      buildingArea: prop.buildingArea,
      surfaceArea: prop.surfaceArea,
      imageUrl: prop.imageUrl,
      description: prop.description,
      facilitiesText: prop.facilities?.join(', ') || '',
      badge: prop.badge || 'Hot Deal',
      status: prop.status,
      agentName: prop.agentName,
      agentPhone: prop.agentPhone,
    });
    setShowPropertyModal(true);
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propForm.title.trim()) {
      showToast('Judul properti tidak boleh kosong!');
      return;
    }

    const facList = propForm.facilitiesText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    let cleanImageUrl = propForm.imageUrl?.trim() || '';
    if (cleanImageUrl && !cleanImageUrl.startsWith('http://') && !cleanImageUrl.startsWith('https://') && !cleanImageUrl.startsWith('/') && !cleanImageUrl.startsWith('data:')) {
      if (cleanImageUrl.includes('.')) {
        cleanImageUrl = 'https://' + cleanImageUrl;
      }
    }

    if (editingProperty) {
      // Update
      const updated: PropertyListing[] = properties.map((p) => {
        if (p.id === editingProperty.id) {
          return {
            ...p,
            title: propForm.title,
            slug: slugify(propForm.title) || p.slug || p.id,
            type: propForm.type,
            price: Number(propForm.price) || 0,
            city: propForm.city,
            address: propForm.address || `${propForm.city}, Indonesia`,
            developer: propForm.developer,
            bedrooms: Number(propForm.bedrooms) || 0,
            bathrooms: Number(propForm.bathrooms) || 0,
            buildingArea: Number(propForm.buildingArea) || 0,
            surfaceArea: Number(propForm.surfaceArea) || 0,
            imageUrl: cleanImageUrl,
            description: propForm.description,
            facilities: facList,
            badge: propForm.badge,
            status: propForm.status,
            agentName: propForm.agentName,
            agentPhone: propForm.agentPhone,
          };
        }
        return p;
      });
      saveProperties(updated);
      setProperties(updated);
      showToast(`Properti "${propForm.title}" berhasil diperbarui!`);
    } else {
      // Create
      const newProp: PropertyListing = {
        id: `prop-${Date.now()}`,
        title: propForm.title,
        slug: slugify(propForm.title) || `prop-${Date.now()}`,
        type: propForm.type,
        price: Number(propForm.price) || 0,
        city: propForm.city,
        address: propForm.address || `${propForm.city}, Indonesia`,
        developer: propForm.developer,
        bedrooms: Number(propForm.bedrooms) || 0,
        bathrooms: Number(propForm.bathrooms) || 0,
        buildingArea: Number(propForm.buildingArea) || 0,
        surfaceArea: Number(propForm.surfaceArea) || 0,
        imageUrl: cleanImageUrl,
        additionalImages: [],
        description: propForm.description,
        facilities: facList,
        badge: propForm.badge,
        status: propForm.status,
        agentName: propForm.agentName,
        agentPhone: propForm.agentPhone,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [newProp, ...properties];
      saveProperties(updated);
      setProperties(updated);
      showToast(`Listing properti "${newProp.title}" berhasil ditambahkan!`);
    }

    setShowPropertyModal(false);
  };

  // Article Actions
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArtForm({
      title: '',
      category: "What's New",
      author: '',
      authorRole: '',
      readTime: '',
      imageUrl: '',
      excerpt: '',
      content: '',
      tagsText: '',
      metaTitle: '',
      metaDescription: '',
      focusKeywords: '',
    });
    setShowSeoAccordion(false);
    setShowArticleModal(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setArtForm({
      title: art.title,
      category: art.category,
      author: art.author,
      authorRole: art.authorRole,
      readTime: art.readTime,
      imageUrl: art.imageUrl,
      excerpt: art.excerpt,
      content: art.content,
      tagsText: art.tags?.join(', ') || '',
      metaTitle: art.metaTitle || '',
      metaDescription: art.metaDescription || '',
      focusKeywords: art.focusKeywords || '',
    });
    setShowSeoAccordion(false);
    setShowArticleModal(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artForm.title.trim()) {
      showToast('Judul artikel tidak boleh kosong!');
      return;
    }

    const tagList = artForm.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const slug = artForm.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let cleanImageUrl = artForm.imageUrl?.trim() || '';
    if (cleanImageUrl && !cleanImageUrl.startsWith('http://') && !cleanImageUrl.startsWith('https://') && !cleanImageUrl.startsWith('/') && !cleanImageUrl.startsWith('data:')) {
      if (cleanImageUrl.includes('.')) {
        cleanImageUrl = 'https://' + cleanImageUrl;
      }
    }

    if (editingArticle) {
      // Update
      const updated: Article[] = articles.map((a) => {
        if (a.id === editingArticle.id) {
          return {
            ...a,
            title: artForm.title,
            slug,
            category: artForm.category,
            author: artForm.author,
            authorRole: artForm.authorRole,
            readTime: artForm.readTime,
            imageUrl: cleanImageUrl,
            excerpt: artForm.excerpt,
            content: artForm.content,
            tags: tagList,
            metaTitle: artForm.metaTitle.trim(),
            metaDescription: artForm.metaDescription.trim(),
            focusKeywords: artForm.focusKeywords.trim(),
          };
        }
        return a;
      });
      saveArticles(updated);
      setArticles(updated);
      showToast(`Artikel "${artForm.title}" berhasil diperbarui!`);
    } else {
      // Create
      const newArt: Article = {
        id: `art-${Date.now()}`,
        title: artForm.title,
        slug,
        category: artForm.category,
        author: artForm.author,
        authorRole: artForm.authorRole,
        readTime: artForm.readTime,
        imageUrl: cleanImageUrl,
        excerpt: artForm.excerpt,
        content: artForm.content,
        publishedAt: new Date().toISOString().split('T')[0],
        status: 'published',
        tags: tagList,
        metaTitle: artForm.metaTitle.trim(),
        metaDescription: artForm.metaDescription.trim(),
        focusKeywords: artForm.focusKeywords.trim(),
      };
      const updated = [newArt, ...articles];
      saveArticles(updated);
      setArticles(updated);
      showToast(`Artikel "${newArt.title}" berhasil dipublikasikan!`);
    }

    setShowArticleModal(false);
  };

  // Delete Action
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'property') {
      const updated = properties.filter((p) => p.id !== deleteConfirm.id);
      saveProperties(updated);
      setProperties(updated);
      showToast(`Listing properti "${deleteConfirm.title}" berhasil dihapus.`);
    } else {
      const updated = articles.filter((a) => a.id !== deleteConfirm.id);
      saveArticles(updated);
      setArticles(updated);
      showToast(`Artikel "${deleteConfirm.title}" berhasil dihapus.`);
    }
    setDeleteConfirm(null);
  };

  // Reset / Clear all demo samples
  const handleResetData = () => {
    setShowResetConfirmModal(true);
  };

  const executeResetAllData = () => {
    clearAllDemoSamples();
    setProperties([]);
    setArticles([]);
    setShowResetConfirmModal(false);
    showToast('Semua sampel demo listingan dan artikel telah berhasil dihapus total tanpa sisa (0 data)!');
  };

  // Manual Live Synchronization
  const handleManualSyncLive = async () => {
    setIsSyncingLive(true);
    try {
      const ok = await syncDataToServer({
        properties,
        articles,
        settings: siteSettingsForm,
      });
      if (ok) {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(`Tersinkronisasi pk ${timeStr}`);
        showToast('Data properti, artikel & pengaturan berhasil disinkronkan langsung ke live server publik!');
      } else {
        showToast('Sinkronisasi tersimpan di browser lokal.');
      }
    } catch {
      showToast('Sinkronisasi tersimpan di browser lokal.');
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Site Settings Action
  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteSettings(siteSettingsForm);
    showToast('Pengaturan logo dan kontak situs berhasil disimpan & diperbarui!');
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      properties,
      articles,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hunianisme-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File backup JSON berhasil diunduh!');
  };

  // Filtered properties
  const filteredProperties = properties.filter((prop) => {
    const matchSearch = 
      prop.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      prop.city.toLowerCase().includes(propSearch.toLowerCase()) ||
      (prop.developer && prop.developer.toLowerCase().includes(propSearch.toLowerCase()));
    const matchType = propTypeFilter === 'all' || prop.type === propTypeFilter;
    const matchCity = propCityFilter === 'all' || prop.city.toLowerCase() === propCityFilter.toLowerCase();
    return matchSearch && matchType && matchCity;
  });

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    const matchSearch = 
      art.title.toLowerCase().includes(artSearch.toLowerCase()) ||
      art.author.toLowerCase().includes(artSearch.toLowerCase());
    const matchCategory = artCategoryFilter === 'all' || art.category === artCategoryFilter;
    return matchSearch && matchCategory;
  });

  // Stats calculation
  const totalValuation = properties.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const rumahCount = properties.filter((p) => p.type === 'rumah').length;
  const apartemenCount = properties.filter((p) => p.type === 'apartemen').length;
  const rukoCount = properties.filter((p) => p.type === 'ruko').length;
  const tanahCount = properties.filter((p) => p.type === 'tanah').length;
  const proyekBaruCount = properties.filter((p) => p.type === 'proyek-baru').length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-slate-300">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold text-lg">Memuat Panel Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Building2 size={20} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight leading-none text-white">
                Hunian<span className="text-blue-400">isme</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Admin Panel
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'properties'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home size={18} />
              <span>Listing Properti</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
              {properties.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'articles'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Newspaper size={18} />
              <span>Artikel & Berita</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
              {articles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings size={18} />
            <span>Logo, Kontak & Data</span>
          </button>
        </nav>

        {/* Admin User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">

          {/* Admin User Info & Logout */}
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                A
              </div>
              <div className="truncate text-xs">
                <div className="font-semibold text-slate-200 truncate">Administrator</div>
                <div className="text-[10px] text-slate-500 truncate">admin@hunianisme.com</div>
              </div>
            </div>
            <button
              onClick={handleBackToWebsite}
              className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-900 transition flex items-center gap-1"
              title="Kembali ke Beranda Website"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Pengelola'}
              {activeTab === 'properties' && 'Manajemen Listing Properti'}
              {activeTab === 'articles' && 'Manajemen Artikel & Edukasi'}
              {activeTab === 'settings' && 'Pengaturan Logo, Kontak & Data'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {activeTab === 'dashboard' && 'Pantau ringkasan performa dan tambahkan konten properti secara manual'}
              {activeTab === 'properties' && 'Tambah, sunting, atau hapus unit properti (Rumah, Apartemen, Ruko, Tanah)'}
              {activeTab === 'articles' && 'Publikasikan panduan KPR, tips interior, dan berita regulasi properti'}
              {activeTab === 'settings' && 'Ubah logo brand, nomor WhatsApp, telepon, alamat kantor, dan kelola pembersihan sampel demo'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleManualSyncLive}
              disabled={isSyncingLive}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
              title="Sinkronkan seluruh data properti, artikel & pengaturan langsung ke live server publik"
            >
              <RefreshCw size={15} className={isSyncingLive ? 'animate-spin' : ''} />
              {isSyncingLive ? 'Menyinkronkan...' : 'Publikasikan ke Live'}
            </button>
            <button
              onClick={handleOpenAddProperty}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
            >
              <PlusCircle size={16} />
              + Tambah Listing
            </button>
            <button
              onClick={handleOpenAddArticle}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
            >
              <PlusCircle size={16} />
              + Tulis Artikel
            </button>
          </div>
        </header>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Total Listing</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{properties.length}</div>
                <div className="text-[11px] text-blue-400 font-semibold mt-1">Aktif di web</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Rumah</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{rumahCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Kategori populer</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Apartemen</div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">{apartemenCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">High-rise unit</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Ruko & Tanah</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{rukoCount + tanahCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Komersial & Lahan</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Proyek Baru</div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">{proyekBaruCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Primary listing</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Artikel Edukasi</div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400 mt-1">{articles.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Published</div>
              </div>
            </div>



            {/* Recent Properties & Articles Quick List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Properties */}
              <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Home size={18} className="text-blue-400" />
                    Listing Properti Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Lihat Semua ({properties.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {properties.slice(0, 4).map((prop) => (
                    <div
                      key={prop.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative w-14 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <SafeImage
                            src={prop.imageUrl}
                            alt={prop.title}
                            fill
                            className="object-cover"
                            sizes="60px"
                            referrerPolicy="no-referrer"
                            fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                          />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white truncate">{prop.title}</h4>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="capitalize text-blue-400 font-medium">{prop.type}</span>
                            <span>•</span>
                            <span>{prop.city}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-200">{formatRupiah(prop.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => setPreviewProperty(prop)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          title="Pratinjau"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditProperty(prop)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800"
                          title="Sunting"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Articles */}
              <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Newspaper size={18} className="text-indigo-400" />
                    Artikel & Panduan Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    Lihat Semua ({articles.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {articles.slice(0, 4).map((art) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative w-14 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <SafeImage
                            src={art.imageUrl}
                            alt={art.title}
                            fill
                            className="object-cover"
                            sizes="60px"
                            referrerPolicy="no-referrer"
                            fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                          />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white truncate">{art.title}</h4>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-indigo-400 font-medium">{art.category}</span>
                            <span>•</span>
                            <span>{art.readTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => setPreviewArticle(art)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          title="Pratinjau"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditArticle(art)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800"
                          title="Sunting"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPERTIES MANAGEMENT */}
        {activeTab === 'properties' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama properti, lokasi, developer..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <select
                  value={propTypeFilter}
                  onChange={(e) => setPropTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Tipe Properti</option>
                  <option value="rumah">Rumah</option>
                  <option value="apartemen">Apartement</option>
                  <option value="ruko">Ruko</option>
                  <option value="tanah">Tanah</option>
                </select>

                <select
                  value={propCityFilter}
                  onChange={(e) => setPropCityFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bogor">Bogor</option>
                  <option value="Depok">Depok</option>
                  <option value="Tangerang">Tangerang</option>
                  <option value="Bekasi">Bekasi</option>
                  <option value="Karawang">Karawang</option>
                </select>

                <button
                  onClick={handleOpenAddProperty}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition ml-auto"
                >
                  <PlusCircle size={16} />
                  + Tambah Properti
                </button>
              </div>
            </div>

            {/* Properties Table */}
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Properti</th>
                      <th className="py-3.5 px-4">Tipe & Kota</th>
                      <th className="py-3.5 px-4">Harga</th>
                      <th className="py-3.5 px-4">Spesifikasi</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-300">
                    {filteredProperties.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          Tidak ada data properti yang sesuai kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-750/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                <SafeImage
                                  src={prop.imageUrl}
                                  alt={prop.title}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                  referrerPolicy="no-referrer"
                                  fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                                />
                              </div>
                              <div className="max-w-xs">
                                <div className="font-bold text-white text-sm truncate">{prop.title}</div>
                                <div className="text-xs text-slate-400 truncate">{prop.address}</div>
                                {prop.badge && (
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md">
                                    {prop.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="capitalize font-semibold text-blue-400">{prop.type}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-red-400" />
                              {prop.city}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">
                              {formatRupiah(prop.price)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Est. {formatRupiah(Math.round(prop.price * 0.007))}/bln
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <span>{prop.bedrooms} KT</span>
                              <span>•</span>
                              <span>{prop.bathrooms} KM</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              LB {prop.buildingArea}m² / LT {prop.surfaceArea}m²
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              prop.status === 'tersedia'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                              ● {prop.status === 'tersedia' ? 'Tersedia' : 'Terjual'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setPreviewProperty(prop)}
                                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                                title="Lihat Tampilan Pembeli"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenEditProperty(prop)}
                                className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-700 transition"
                                title="Edit Properti"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'property', id: prop.id, title: prop.title })}
                                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition"
                                title="Hapus Properti"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ARTICLES MANAGEMENT */}
        {activeTab === 'articles' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari judul artikel, penulis..."
                  value={artSearch}
                  onChange={(e) => setArtSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <select
                  value={artCategoryFilter}
                  onChange={(e) => setArtCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="What's New">What&apos;s New</option>
                  <option value="Area Explorer">Area Explorer</option>
                  <option value="Project Radar">Project Radar</option>
                  <option value="Keys to Know">Keys to Know</option>
                  <option value="Property Insights">Property Insights</option>
                </select>

                <button
                  onClick={handleOpenAddArticle}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition ml-auto"
                >
                  <PlusCircle size={16} />
                  + Tulis Artikel Baru
                </button>
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Artikel</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Penulis</th>
                      <th className="py-3.5 px-4">Tanggal Rilis</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-300">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Tidak ada artikel yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-750/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                <SafeImage
                                  src={art.imageUrl}
                                  alt={art.title}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                  referrerPolicy="no-referrer"
                                  fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                                />
                              </div>
                              <div className="max-w-md">
                                <div className="font-bold text-white text-sm line-clamp-1">{art.title}</div>
                                <div className="text-xs text-slate-400 line-clamp-1">{art.excerpt}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
                              {art.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-xs">
                            <div className="font-semibold text-white">{art.author}</div>
                            <div className="text-slate-500 text-[11px]">{art.authorRole}</div>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            <div>{art.publishedAt}</div>
                            <div className="text-slate-500 text-[11px]">{art.readTime}</div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setPreviewArticle(art)}
                                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                                title="Baca Artikel"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenEditArticle(art)}
                                className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-700 transition"
                                title="Edit Artikel"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'article', id: art.id, title: art.title })}
                                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition"
                                title="Hapus Artikel"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & BACKUP */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            {/* Form Settings Logo & Kontak */}
            <form onSubmit={handleSaveSiteSettings} className="space-y-6">
              {/* SECTION 1: LOGO & IDENTITAS BRAND */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                      <ImageIcon size={22} className="text-blue-400" />
                      Logo &amp; Identitas Website
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Kustomisasi logo brand, nama situs, dan slogan yang tampil di header dan footer website utama.
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-bold border border-blue-500/20 shrink-0">
                    Live Navbar Preview
                  </span>
                </div>

                {/* Live Preview Box */}
                <div className="bg-white rounded-2xl p-5 border border-slate-700 shadow-inner flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center">
                    {isValidImageUrl(siteSettingsForm.logoUrl) ? (
                      <div className="relative h-12 w-52 sm:w-64 max-h-12 overflow-hidden flex items-center">
                        <SafeImage
                          src={siteSettingsForm.logoUrl}
                          alt={siteSettingsForm.brandName || 'Logo'}
                          fill
                          className="object-contain object-left"
                          sizes="260px"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                            {siteSettingsForm.brandName || 'Hunianisme'}
                          </div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">
                            {siteSettingsForm.brandTagline || 'Cari & Temukan Hunian'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Tampilan Live di Header Navigasi
                  </div>
                </div>

                {/* Input Fields for Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Nama Brand / Judul Website *
                    </label>
                    <input
                      type="text"
                      required
                      value={siteSettingsForm.brandName}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, brandName: e.target.value })}
                      placeholder="Contoh: Hunianisme"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Tagline / Slogan Situs
                    </label>
                    <input
                      type="text"
                      value={siteSettingsForm.brandTagline}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, brandTagline: e.target.value })}
                      placeholder="Contoh: Cari & Temukan Hunian"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Logo Image URL & Presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    URL Gambar Logo (Opsional / Kustom)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={siteSettingsForm.logoUrl || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, logoUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... atau tautan gambar langsung (PNG/JPG/SVG)"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {siteSettingsForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSiteSettingsForm({ ...siteSettingsForm, logoUrl: '' })}
                        className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-xl font-bold transition"
                        title="Hapus Logo Kustom & Gunakan Ikon Bawaan"
                      >
                        Reset Ikon
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Kosongkan kolom URL jika ingin menggunakan ikon gedung estetik bawaan sistem.
                  </p>
                </div>

                {/* Favicon URL & Live Preview */}
                <div className="space-y-3 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      URL Favicon Browser Tab
                    </label>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                      Aktif di Tab Browser
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {isValidImageUrl(siteSettingsForm.faviconUrl) ? (
                        <SafeImage
                          src={siteSettingsForm.faviconUrl}
                          alt="Favicon"
                          width={28}
                          height={28}
                          className="object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Building2 size={18} className="text-blue-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={siteSettingsForm.faviconUrl || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, faviconUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/.../favicon.png"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ikon kecil yang tampil pada tab peramban (browser) dan penanda bookmark pengguna.
                  </p>
                </div>
              </div>

              {/* SECTION 2: PENGATURAN KONTAK & KANTOR */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-700/80 pb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                    <Phone size={22} className="text-emerald-400" />
                    Informasi Kontak &amp; Kantor Layanan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Kontak ini otomatis diperbarui pada tombol WhatsApp mengambang, footer situs, dan informasi konsultasi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Nomor WhatsApp Pelanggan *
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        value={siteSettingsForm.contactWhatsapp}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactWhatsapp: e.target.value })}
                        placeholder="Contoh: 6281234567890 (diawali 62)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Format angka tanpa spasi/tanda plus (misal: 6281234567890)</span>
                        {siteSettingsForm.contactWhatsapp && (
                          <a
                            href={`https://wa.me/${siteSettingsForm.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink size={11} />
                            Uji Chat WA
                          </a>
                        )}
                      </div>
                    </div>
                  </div>



                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Alamat Email Layanan *
                    </label>
                    <input
                      type="email"
                      required
                      value={siteSettingsForm.contactEmail}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactEmail: e.target.value })}
                      placeholder="Contoh: layanan@hunianisme.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Jam Operasional */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Jam Layanan / Kerja
                    </label>
                    <input
                      type="text"
                      value={siteSettingsForm.officeHours || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, officeHours: e.target.value })}
                      placeholder="Contoh: Senin - Sabtu: 08.00 - 18.00 WIB"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Alamat Kantor */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Alamat Kantor Fisik / Graha
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.officeAddress}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, officeAddress: e.target.value })}
                      placeholder="Contoh: Gedung Graha Hunianisme, SCBD Lot 8, Jakarta Selatan"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95"
                  >
                    <Check size={18} />
                    Simpan Pengaturan Logo &amp; Kontak
                  </button>
                </div>
              </div>
            </form>

            {/* SECTION 3: HAPUS SEMUA SAMPEL DEMO (KOSONGKAN TOTAL DATA) */}
            <div className="bg-slate-800/90 border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-400">
                    Hapus Semua Sampel Demo (Kosongkan Data Total)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                    Gunakan tombol di bawah ini untuk <strong>menghapus seluruh sampel data bawaan</strong> (11 properti demo dan 4 artikel edukasi) tanpa tersisa sama sekali. Website Anda akan menjadi <strong>100% kosong (0 data)</strong> agar Anda leluasa mengunggah listing properti dan artikel riil Anda sendiri dari nol.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg active:scale-95"
                >
                  <Trash2 size={16} />
                  Hapus Semua Sampel Demo Sekarang
                </button>
              </div>
            </div>

            {/* SECTION 4: CADANGKAN DATA */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Cadangkan Data (Backup File JSON)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                    Unduh cadangan data seluruh listing properti dan artikel aktif Anda ke dalam file JSON lokal di komputer.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition"
                >
                  <Download size={16} />
                  Unduh Cadangan JSON
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: TAMBAH / EDIT PROPERTY */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Home size={18} className="text-blue-400" />
                {editingProperty ? 'Sunting Listing Properti' : 'Tambah Listing Properti Baru'}
              </h2>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProperty} className="overflow-y-auto p-6 space-y-5">
              {/* Judul & Tipe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Judul Properti *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cluster Freja Modern Tropical House"
                    value={propForm.title}
                    onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipe Properti *
                  </label>
                  <select
                    value={propForm.type}
                    onChange={(e) => setPropForm({ ...propForm, type: e.target.value as PropertyType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rumah">Rumah</option>
                    <option value="apartemen">Apartement</option>
                    <option value="ruko">Ruko</option>
                    <option value="tanah">Tanah</option>
                  </select>
                </div>
              </div>

              {/* Harga & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Harga Properti (Rp) *
                    </label>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000000}
                    value={propForm.price ? propForm.price : ''}
                    placeholder="Contoh: 1500000000"
                    onChange={(e) => setPropForm({ ...propForm, price: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {propForm.price > 0 && (
                    <div className="text-xs text-blue-400 font-bold mt-1">
                      {formatRupiah(propForm.price)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Kota / Wilayah *
                  </label>
                  <select
                    value={propForm.city}
                    onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Jakarta">Jakarta</option>
                    <option value="Tangerang">Tangerang</option>
                    <option value="Bekasi">Bekasi</option>
                    <option value="Depok">Depok</option>
                    <option value="Bogor">Bogor</option>
                    <option value="Karawang">Karawang</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Surabaya">Surabaya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Developer / Pengembang
                  </label>
                  <input
                    type="text"
                    placeholder="Nama developer / pengembang (opsional)"
                    value={propForm.developer}
                    onChange={(e) => setPropForm({ ...propForm, developer: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Alamat Lengkap Properti
                </label>
                <input
                  type="text"
                  placeholder="Alamat lengkap properti"
                  value={propForm.address}
                  onChange={(e) => setPropForm({ ...propForm, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Spesifikasi: KT, KM, LB, LT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Kamar Tidur (KT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={propForm.bedrooms || ''}
                    onChange={(e) => setPropForm({ ...propForm, bedrooms: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Kamar Mandi (KM)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={propForm.bathrooms || ''}
                    onChange={(e) => setPropForm({ ...propForm, bathrooms: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Luas Bangunan (LB m²)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={propForm.buildingArea || ''}
                    onChange={(e) => setPropForm({ ...propForm, buildingArea: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Luas Tanah (LT m²)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={propForm.surfaceArea || ''}
                    onChange={(e) => setPropForm({ ...propForm, surfaceArea: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>

              {/* Foto Properti (Input URL Bersih Mandiri Tanpa Preset) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Foto Utama Properti (Opsional)
                  </label>
                  {propForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setPropForm({ ...propForm, imageUrl: '' })}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Tempel URL gambar foto properti (misal: https://...)"
                  value={propForm.imageUrl}
                  onChange={(e) => setPropForm({ ...propForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />

                {/* Preview Image */}
                {isValidImageUrl(propForm.imageUrl) ? (
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700 mt-2">
                    <SafeImage
                      src={propForm.imageUrl}
                      alt="Pratinjau Foto"
                      fill
                      className="object-cover"
                      sizes="600px"
                      referrerPolicy="no-referrer"
                      fallbackSrc={DEFAULT_PROPERTY_IMAGE}
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-md text-[10px] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Pratinjau Foto Listing
                    </div>
                  </div>
                ) : propForm.imageUrl ? (
                  <p className="text-[11px] text-amber-400 mt-1">
                    Format tautan gambar akan otomatis disesuaikan saat disimpan.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Kolom foto bersih mandiri. Jika dikosongkan, sistem otomatis menggunakan ilustrasi gambar hunian rapi.
                  </p>
                )}
              </div>

              {/* Badge, Status & Fasilitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Label Promosi / Badge
                  </label>
                  <select
                    value={propForm.badge}
                    onChange={(e) => setPropForm({ ...propForm, badge: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tanpa Badge (Polos)</option>
                    <option value="Hot Deal">Hot Deal</option>
                    <option value="Proyek Baru">Proyek Baru</option>
                    <option value="Siap Huni">Siap Huni</option>
                    <option value="DP 0%">DP 0%</option>
                    <option value="Kavling Hoek">Kavling Hoek</option>
                    <option value="Cicilan Ringan">Cicilan Ringan</option>
                    <option value="Luxury Villa">Luxury Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Status Ketersediaan
                  </label>
                  <select
                    value={propForm.status}
                    onChange={(e) => setPropForm({ ...propForm, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tersedia">Tersedia (Aktif)</option>
                    <option value="terjual">Terjual (Sold Out)</option>
                    <option value="booking">Sedang Dibooking</option>
                  </select>
                </div>
              </div>

              {/* Fasilitas */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fasilitas Utama (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Pisahkan dengan koma, contoh: Carport, Keamanan 24 Jam, Taman"
                  value={propForm.facilitiesText}
                  onChange={(e) => setPropForm({ ...propForm, facilitiesText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Agen Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Agen Hunianisme
                  </label>
                  <input
                    type="text"
                    placeholder="Nama agen / kontak"
                    value={propForm.agentName}
                    onChange={(e) => setPropForm({ ...propForm, agentName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp Agen (Format 62...)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 6281234567890"
                    value={propForm.agentPhone}
                    onChange={(e) => setPropForm({ ...propForm, agentPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Deskripsi Lengkap Properti
                </label>
                <textarea
                  rows={4}
                  value={propForm.description}
                  onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                  placeholder="Tuliskan keunggulan lokasi, spesifikasi material, jarak ke tol, stasiun..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  {editingProperty ? 'Simpan Perubahan' : 'Tambahkan ke Listing Web'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT ARTIKEL */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Newspaper size={18} className="text-indigo-400" />
                {editingArticle ? 'Sunting Artikel' : 'Tulis Artikel & Panduan Baru'}
              </h2>
              <button
                onClick={() => setShowArticleModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveArticle} className="overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 5 Tips Memilih KPR Syariah vs Konvensional di 2026"
                  value={artForm.title}
                  onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Kategori Artikel *
                  </label>
                  <select
                    value={artForm.category}
                    onChange={(e) => setArtForm({ ...artForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="What's New">What&apos;s New</option>
                    <option value="Area Explorer">Area Explorer</option>
                    <option value="Project Radar">Project Radar</option>
                    <option value="Keys to Know">Keys to Know</option>
                    <option value="Property Insights">Property Insights</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estimasi Waktu Baca
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 5 min baca"
                    value={artForm.readTime}
                    onChange={(e) => setArtForm({ ...artForm, readTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Penulis & Peran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Penulis
                  </label>
                  <input
                    type="text"
                    placeholder="Nama penulis artikel"
                    value={artForm.author}
                    onChange={(e) => setArtForm({ ...artForm, author: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Gelar / Peran Penulis
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Senior Property Analyst"
                    value={artForm.authorRole}
                    onChange={(e) => setArtForm({ ...artForm, authorRole: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Cover Foto (Input URL Bersih Mandiri Tanpa Preset) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Foto Sampul Artikel (Opsional)
                  </label>
                  {artForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setArtForm({ ...artForm, imageUrl: '' })}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Tempel URL gambar sampul artikel (misal: https://...)"
                  value={artForm.imageUrl}
                  onChange={(e) => setArtForm({ ...artForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />

                {/* Preview Image */}
                {isValidImageUrl(artForm.imageUrl) ? (
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700 mt-2">
                    <SafeImage
                      src={artForm.imageUrl}
                      alt="Pratinjau Foto Sampul"
                      fill
                      className="object-cover"
                      sizes="600px"
                      referrerPolicy="no-referrer"
                      fallbackSrc={DEFAULT_ARTICLE_IMAGE}
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-md text-[10px] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Pratinjau Foto Sampul
                    </div>
                  </div>
                ) : artForm.imageUrl ? (
                  <p className="text-[11px] text-amber-400 mt-1">
                    Format tautan gambar akan otomatis disesuaikan saat disimpan.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Kolom foto bersih mandiri. Jika dikosongkan, sistem otomatis menggunakan ilustrasi gambar artikel rapi.
                  </p>
                )}
              </div>

              {/* Ringkasan (Excerpt) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ringkasan Singkat (Excerpt)
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat pengantar artikel untuk kartu berita..."
                  value={artForm.excerpt}
                  onChange={(e) => setArtForm({ ...artForm, excerpt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Isi Konten dengan Rich Formatting Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Isi Lengkap Artikel
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setContentTab('write')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition ${
                        contentTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tulis
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab('preview')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition ${
                        contentTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pratinjau
                    </button>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 border border-slate-700 rounded-t-xl text-slate-300">
                  <button
                    type="button"
                    onClick={() => applyFormatting('<b>', '</b>', 'teks tebal')}
                    title="Tebalkan Teks (Bold)"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition flex items-center gap-1 text-xs font-bold px-2.5"
                  >
                    <Bold size={14} />
                    <span>Bold</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyFormatting('<i>', '</i>', 'teks miring')}
                    title="Miringkan Teks (Italic)"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition flex items-center gap-1 text-xs italic px-2.5"
                  >
                    <Italic size={14} />
                    <span>Italic</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenLinkModal}
                    title="Sisipkan Link (Otomatis Biru)"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-blue-400 transition flex items-center gap-1 text-xs font-semibold px-2.5 text-blue-400"
                  >
                    <Link2 size={14} />
                    <span>Link</span>
                  </button>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  <button
                    type="button"
                    onClick={() => applyFormatting('<div class="text-left">\n', '\n</div>', 'Teks rata kiri')}
                    title="Rata Kiri"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                  >
                    <AlignLeft size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => applyFormatting('<div class="text-center">\n', '\n</div>', 'Teks rata tengah')}
                    title="Rata Tengah"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                  >
                    <AlignCenter size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => applyFormatting('<div class="text-right">\n', '\n</div>', 'Teks rata kanan')}
                    title="Rata Kanan"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                  >
                    <AlignRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => applyFormatting('<div class="text-justify">\n', '\n</div>', 'Teks rata kanan-kiri (2-2 nya)')}
                    title="Rata 2-2 nya (Justify / Kanan-Kiri)"
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition flex items-center gap-1 text-xs px-2"
                  >
                    <AlignJustify size={15} />
                    <span className="text-[10px] hidden sm:inline">Rata 2-2 nya</span>
                  </button>
                </div>

                {/* Editor or Preview */}
                {contentTab === 'write' ? (
                  <textarea
                    ref={contentTextareaRef}
                    rows={8}
                    placeholder="Tuliskan isi lengkap artikel di sini... Gunakan tombol toolbar di atas untuk menebalkan teks, menambahkan link warna biru, atau mengatur perataan paragraf (kiri, tengah, kanan, rata 2-2 nya)."
                    value={artForm.content}
                    onChange={(e) => setArtForm({ ...artForm, content: e.target.value })}
                    className="w-full bg-slate-800 border-x border-b border-slate-700 rounded-b-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                  />
                ) : (
                  <div className="w-full bg-slate-900 border-x border-b border-slate-700 rounded-b-xl p-5 min-h-[160px] text-sm text-slate-200">
                    {artForm.content ? (
                      <ArticleBodyRenderer content={artForm.content} className="text-slate-100" />
                    ) : (
                      <span className="text-slate-500 italic text-xs">Belum ada konten artikel untuk dipratinjau.</span>
                    )}
                  </div>
                )}

                {/* Modal Sub-Dialog Sisipkan Link */}
                {showLinkModal && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <Link2 size={16} className="text-blue-400" />
                          <span>Sisipkan Tautan (Link Biru)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLinkModal(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Teks Yang Ditampilkan
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Baca selengkapnya di sini"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Alamat URL Link
                          </label>
                          <input
                            type="text"
                            placeholder="https://... atau /properti..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                          />
                          <p className="text-[11px] text-blue-400 mt-1">
                            *Link otomatis akan tampil berwarna biru dan bergaris bawah di artikel.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowLinkModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertLink}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                        >
                          <Check size={14} />
                          <span>Sisipkan Link</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tag Topik (Pisahkan koma)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KPR, Investasi, Tips Beli Rumah"
                  value={artForm.tagsText}
                  onChange={(e) => setArtForm({ ...artForm, tagsText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bagian Optimasi SEO & Google Search (Tersembunyi dari Tampilan Publik) */}
              <div className="border border-slate-700/80 rounded-2xl overflow-hidden bg-slate-950/60">
                <button
                  type="button"
                  onClick={() => setShowSeoAccordion(!showSeoAccordion)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Globe size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Optimasi Mesin Pencari &amp; Google (SEO)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                          Tersembunyi di Web
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Metadata ini tidak tampil di layar pembaca, hanya dibaca Googlebot untuk menaikkan peringkat.
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {showSeoAccordion ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {showSeoAccordion && (
                  <div className="p-4 pt-2 border-t border-slate-800 space-y-4 bg-slate-900/50">
                    
                    {/* Meta Title */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Judul SEO / Google (Meta Title)
                        </label>
                        <span className={`text-[10px] font-mono ${artForm.metaTitle.length > 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {artForm.metaTitle.length}/60 karakter
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={artForm.title || "Kosongkan jika ingin otomatis mengikuti judul artikel"}
                        value={artForm.metaTitle}
                        onChange={(e) => setArtForm({ ...artForm, metaTitle: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        *Judul yang akan ditampilkan Google di halaman hasil pencarian.
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Deskripsi Cuplikan Google (Meta Description)
                        </label>
                        <span className={`text-[10px] font-mono ${artForm.metaDescription.length > 160 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {artForm.metaDescription.length}/160 karakter
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        placeholder={artForm.excerpt || "Ringkasan padat dan menarik untuk mengundang klik di hasil pencarian Google..."}
                        value={artForm.metaDescription}
                        onChange={(e) => setArtForm({ ...artForm, metaDescription: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        *Cuplikan rangkuman di bawah judul di hasil pencarian Google.
                      </p>
                    </div>

                    {/* Focus Keywords */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kata Kunci Target Google (Focus Keywords)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: rumah bekasi murah, setu bebas banjir, kpr rumah bekasi"
                        value={artForm.focusKeywords}
                        onChange={(e) => setArtForm({ ...artForm, focusKeywords: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        *Kata kunci tersembunyi yang disisipkan ke meta tags dan JSON-LD Google Article Schema.
                      </p>
                    </div>

                    {/* Pratinjau Tampilan Google */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" />
                        Pratinjau Hasil Pencarian Google
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-xs text-left">
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1 truncate">
                          <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">H</span>
                          <span className="font-medium text-slate-700">Hunianisme</span>
                          <span className="text-slate-400">&rsaquo;</span>
                          <span className="text-slate-500 truncate">artikel &rsaquo; {artForm.title ? slugify(artForm.title) : 'judul-artikel'}</span>
                        </div>
                        <div className="text-sm font-semibold text-blue-700 line-clamp-1 hover:underline cursor-pointer">
                          {artForm.metaTitle || artForm.title || 'Judul Artikel yang Menarik di Google'} | Hunianisme
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {artForm.metaDescription || artForm.excerpt || 'Deskripsi rangkuman artikel properti yang menjelaskan intisari informasi penting bagi calon pembaca di Google...'}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  {editingArticle ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/30">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-lg text-white">Konfirmasi Penghapusan</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Apakah Anda yakin ingin menghapus {deleteConfirm.type === 'property' ? 'listing properti' : 'artikel'}:
              <br />
              <strong className="text-white mt-1 block">&ldquo;{deleteConfirm.title}&rdquo;</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-400 hover:text-white font-semibold text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET TOTAL / CLEAR ALL DATA DIALOG */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/40 shrink-0">
                <Trash2 size={26} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Hapus Semua Sampel Demo?</h3>
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Kosongkan Total Data</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Apakah Anda yakin ingin <strong className="text-red-300">menghapus semua sampel demo properti dan artikel</strong>? Seluruh data bawaan akan dihapus tanpa sisa sama sekali (benar-benar menjadi kosong 0 data) agar Anda dapat mengisi data riil sendiri.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2.5 text-slate-400 hover:text-white font-semibold text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={executeResetAllData}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Ya, Hapus Semua Sampel Demo
              </button>
            </div>
          </div>
        </div>
      )}



      {/* PREVIEW MODALS */}
      <PropertyDetailModal
        property={previewProperty}
        onClose={() => setPreviewProperty(null)}
      />

      <ArticleDetailModal
        article={previewArticle}
        onClose={() => setPreviewArticle(null)}
      />

    </div>
  );
}

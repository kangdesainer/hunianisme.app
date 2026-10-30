export type PropertyType = 'rumah' | 'apartemen' | 'ruko' | 'tanah' | 'proyek-baru';

export interface PropertyListing {
  id: string;
  title: string;
  slug?: string;
  type: PropertyType;
  price: number; // in IDR
  priceDisplay?: string;
  city: string;
  address: string;
  developer?: string;
  bedrooms: number;
  bathrooms: number;
  buildingArea: number; // LB m2
  surfaceArea: number; // LT m2
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  facilities: string[];
  badge?: string; // e.g. 'Hot Deal', 'Proyek Baru', 'Siap Huni', 'DP 0%'
  status: 'tersedia' | 'terjual' | 'booking';
  agentName: string;
  agentPhone: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  authorRole: string;
  readTime: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  status: 'published' | 'draft';
  tags: string[];
  // SEO Meta Fields (Hidden from visual layout, read by Google & search engines)
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string;
}

export interface KPRCalculation {
  propertyPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanAmount: number;
  interestRate: number; // annual percentage e.g. 5.5%
  tenorYears: number;
  monthlyInstallment: number;
}

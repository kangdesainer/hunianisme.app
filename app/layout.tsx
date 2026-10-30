import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Hunianisme',
  description: 'Etalase digital yang digunakan untuk memasarkan, menjual, membeli, atau menyewakan berbagai jenis property secara online',
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/drtx7dnvs/image/upload/v1792769249/wibrvmd6ghunxrflgxcl.png' },
      { url: 'https://res.cloudinary.com/drtx7dnvs/image/upload/v1792769249/wibrvmd6ghunxrflgxcl.png', type: 'image/png' },
    ],
    shortcut: ['https://res.cloudinary.com/drtx7dnvs/image/upload/v1792769249/wibrvmd6ghunxrflgxcl.png'],
    apple: [
      { url: 'https://res.cloudinary.com/drtx7dnvs/image/upload/v1792769249/wibrvmd6ghunxrflgxcl.png' },
    ],
  },
  openGraph: {
    title: 'Hunianisme',
    description: 'Etalase digital yang digunakan untuk memasarkan, menjual, membeli, atau menyewakan berbagai jenis property secara online',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hunianisme',
    description: 'Etalase digital yang digunakan untuk memasarkan, menjual, membeli, atau menyewakan berbagai jenis property secara online',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

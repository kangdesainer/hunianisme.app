'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { isValidImageUrl, DEFAULT_FALLBACK_IMAGE } from '@/lib/imageUtils';
import { Image as ImageIcon } from 'lucide-react';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  fallback?: React.ReactNode;
}

export default function SafeImage({
  src,
  alt = '',
  fallbackSrc = '',
  fallback,
  className = '',
  referrerPolicy = 'no-referrer',
  ...rest
}: SafeImageProps) {
  // Track failed URLs so if the source changes, error state is automatically reset without useEffect
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const rawSrc = typeof src === 'string' ? src.trim() : '';
  const isRawValid = isValidImageUrl(rawSrc);
  const isFallbackValid = isValidImageUrl(fallbackSrc);

  // If user provided a valid src and it hasn't failed, use it.
  // Only try fallbackSrc if a real src was provided but failed to load.
  const currentSrc =
    isRawValid && failedSrc !== rawSrc
      ? rawSrc
      : rawSrc && failedSrc === rawSrc && isFallbackValid && failedSrc !== fallbackSrc
      ? fallbackSrc.trim()
      : '';

  // If no image source or image failed to load
  if (!currentSrc) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        className={`w-full h-full min-h-[120px] bg-slate-100 dark:bg-slate-850 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-1.5 select-none ${className}`}
        aria-label={alt || 'Placeholder gambar'}
      >
        <ImageIcon size={22} className="opacity-50" />
        <span className="text-[10px] font-medium opacity-60">Tidak ada foto</span>
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
      onError={() => {
        setFailedSrc(currentSrc);
      }}
      {...rest}
    />
  );
}

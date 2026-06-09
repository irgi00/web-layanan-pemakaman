'use client';

import { type ImgHTMLAttributes, useEffect, useState } from 'react';
import { DEFAULT_CEMETERY_IMAGE, getCemeteryImageUrl } from '@/lib/cemetery-image';
import { cn } from '@/lib/utils';

interface CemeteryImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
}

export function CemeteryImage({
  src,
  alt,
  className,
  onError,
  ...props
}: CemeteryImageProps) {
  const normalizedSrc = getCemeteryImageUrl(src);
  const [resolvedSrc, setResolvedSrc] = useState(normalizedSrc);

  useEffect(() => {
    setResolvedSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      className={cn(className)}
      onError={(event) => {
        if (resolvedSrc !== DEFAULT_CEMETERY_IMAGE) {
          setResolvedSrc(DEFAULT_CEMETERY_IMAGE);
        }

        onError?.(event);
      }}
    />
  );
}

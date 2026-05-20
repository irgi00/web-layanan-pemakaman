'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackHref = '/',
  label = 'Kembali',
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleBack}
      className={cn(
        'group h-auto justify-start gap-2 px-0 py-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-primary',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </Button>
  );
}

'use client';

import { useEffect, useId, useState } from 'react';
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetError,
  type CloudinaryUploadWidgetOptions,
  type CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import { AlertCircle, ImagePlus, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CloudinaryUploadProps {
  value: string;
  onChange: (value: string) => void;
  previewAlt: string;
  inputLabel: string;
  inputPlaceholder: string;
  helperText?: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  disabled?: boolean;
  fallbackSrc?: string;
  showPreview?: boolean;
  previewClassName?: string;
  uploadButtonText?: string;
  replaceButtonText?: string;
  clearButtonText?: string;
  maxFileSizeInBytes?: number;
}

function extractSecureUrl(result: CloudinaryUploadWidgetResults) {
  const info = result.info;

  if (!info || typeof info !== 'object' || Array.isArray(info)) {
    return null;
  }

  if ('secure_url' in info && typeof info.secure_url === 'string') {
    return info.secure_url;
  }

  return null;
}

function getCloudinaryErrorMessage(error: CloudinaryUploadWidgetError | undefined) {
  if (!error) {
    return 'Upload gambar ke Cloudinary gagal.';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }

    if ('statusText' in error && typeof error.statusText === 'string' && error.statusText.trim()) {
      return error.statusText;
    }
  }

  return 'Upload gambar ke Cloudinary gagal.';
}

export function CloudinaryUpload({
  value,
  onChange,
  previewAlt,
  inputLabel,
  inputPlaceholder,
  helperText,
  emptyStateTitle,
  emptyStateDescription,
  disabled = false,
  fallbackSrc,
  showPreview = true,
  previewClassName,
  uploadButtonText = 'Upload Foto',
  replaceButtonText = 'Ganti Foto',
  clearButtonText = 'Kosongkan',
  maxFileSizeInBytes = 5 * 1024 * 1024,
}: CloudinaryUploadProps) {
  const inputId = useId();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const [previewSrc, setPreviewSrc] = useState<string | null>(value.trim() || fallbackSrc || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewSrc(value.trim() || fallbackSrc || null);
  }, [fallbackSrc, value]);

  const widgetEnabled = Boolean(cloudName && uploadPreset);
  const widgetOptions = {
    sources: ['local'],
    multiple: false,
    maxFiles: 1,
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    maxImageFileSize: maxFileSizeInBytes,
    singleUploadAutoClose: true,
    showCompletedButton: false,
  } as unknown as CloudinaryUploadWidgetOptions;

  return (
    <div className="space-y-4">
      {showPreview ? (
        <div className="overflow-hidden rounded-[20px] border border-border/70 bg-muted/30">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={previewAlt}
              className={cn('h-56 w-full object-cover', previewClassName)}
              onError={() => {
                if (fallbackSrc && previewSrc !== fallbackSrc) {
                  setPreviewSrc(fallbackSrc);
                  return;
                }

                setUploadError('Preview gambar tidak dapat dimuat. Periksa kembali URL gambar.');
              }}
            />
          ) : (
            <div
              className={cn(
                'flex h-56 flex-col items-center justify-center gap-3 px-6 text-center',
                previewClassName
              )}
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImagePlus className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{emptyStateTitle}</p>
                <p className="text-sm text-muted-foreground">{emptyStateDescription}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <CldUploadWidget
          uploadPreset={uploadPreset}
          config={cloudName ? { cloud: { cloudName } } : undefined}
          options={widgetOptions}
          onQueuesStart={() => {
            setUploading(true);
            setUploadError(null);
          }}
          onQueuesEnd={() => {
            setUploading(false);
          }}
          onSuccess={(result) => {
            const secureUrl = extractSecureUrl(result);

            if (!secureUrl) {
              setUploadError('Cloudinary tidak mengembalikan secure_url gambar.');
              return;
            }

            onChange(secureUrl);
            setPreviewSrc(secureUrl);
            setUploadError(null);
          }}
          onError={(error) => {
            setUploading(false);
            setUploadError(getCloudinaryErrorMessage(error));
          }}
        >
          {({ open, isLoading }) => (
            <Button
              type="button"
              className="w-full rounded-full sm:w-auto"
              disabled={disabled || !widgetEnabled || uploading || isLoading}
              onClick={() => {
                setUploadError(null);
                open();
              }}
            >
              {uploading || isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Membuka uploader...
                </>
              ) : value.trim() ? (
                <>
                  <RefreshCcw className="mr-2 size-4" />
                  {replaceButtonText}
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 size-4" />
                  {uploadButtonText}
                </>
              )}
            </Button>
          )}
        </CldUploadWidget>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={disabled || (!value.trim() && !fallbackSrc)}
          onClick={() => {
            onChange('');
            setPreviewSrc(fallbackSrc || null);
            setUploadError(null);
          }}
        >
          <Trash2 className="mr-2 size-4" />
          {clearButtonText}
        </Button>
      </div>

      {!widgetEnabled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME atau NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET belum diatur.
          Upload widget dinonaktifkan sementara, tetapi input URL manual tetap bisa dipakai.
        </div>
      ) : null}

      {uploadError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={inputId}>{inputLabel}</Label>
        <Input
          id={inputId}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setUploadError(null);
          }}
          placeholder={inputPlaceholder}
          disabled={disabled}
        />
        {helperText ? <p className="text-xs leading-5 text-muted-foreground">{helperText}</p> : null}
      </div>
    </div>
  );
}

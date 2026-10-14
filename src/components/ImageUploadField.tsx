import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { getCategoryFallback } from '../data/botImages';
import { BotCategory } from '../types';

interface ImageUploadFieldProps {
  currentImage: string;
  category: BotCategory;
  onImageChange: (imageUrl: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

/**
 * Compress and optimize an image file into a performant WebP/JPEG data URL
 * to ensure persistent storage without exceeding browser quota.
 */
async function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, preserve raw data URL to keep vector sharpness or animation
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));

    img.onload = () => {
      try {
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first for maximum compression efficiency, fallback to jpeg
        let optimizedDataUrl = canvas.toDataURL('image/webp', 0.88);
        if (!optimizedDataUrl.startsWith('data:image/webp')) {
          optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        }
        resolve(optimizedDataUrl);
      } catch {
        resolve(reader.result as string);
      }
    };

    img.onerror = () => reject(new Error('Invalid image file content.'));
    reader.readAsDataURL(file);
  });
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  currentImage,
  category,
  onImageChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackImage = getCategoryFallback(category);
  const displayImage = currentImage || fallbackImage;

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMsg(`Unsupported file type (${file.type || 'unknown'}). Please choose JPEG, PNG, WebP, GIF, or SVG.`);
      return;
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    // 3. Process and optimize
    setIsUploading(true);
    try {
      const optimizedUrl = await optimizeImageFile(file);
      onImageChange(optimizedUrl);
      setSuccessMsg(`Image successfully uploaded and optimized (${(file.size / 1024).toFixed(0)} KB)!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be re-selected if replaced
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(fallbackImage);
    setErrorMsg(null);
    setSuccessMsg('Reset to default category cover image.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a valid image URL');
      return;
    }
    try {
      new URL(urlInput);
      onImageChange(urlInput.trim());
      setUrlInput('');
      setSuccessMsg('Custom image URL applied successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Invalid URL format. Please enter a full http:// or https:// URL.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-200">
          Bot Cover Image <span className="text-cyan-400 font-normal">(Visible on Storefront & Catalog)</span>
        </label>
        {/* Toggle between Upload & URL Mode */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'upload' ? 'bg-[#0088cc] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'url' ? 'bg-[#0088cc] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Main Upload Box & Live Preview Area */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Preview Thumbnail Box */}
        <div className="sm:col-span-4 relative rounded-xl border border-white/10 bg-slate-950 overflow-hidden group aspect-[4/3] flex items-center justify-center shadow-inner">
          <img
            src={displayImage}
            alt="Bot cover preview"
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

          {/* Status Badge */}
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-300">
            {currentImage && currentImage !== fallbackImage ? 'Custom Cover' : 'Category Default'}
          </div>

          {/* Remove / Reset Button */}
          {currentImage && currentImage !== fallbackImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/30 hover:bg-rose-900 transition-colors shadow-sm cursor-pointer"
              title="Remove custom image and reset to default"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 text-cyan-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-[10px] font-mono font-semibold">Processing Image...</span>
            </div>
          )}
        </div>

        {/* Dropzone / Upload Action Box */}
        <div className="sm:col-span-8">
          {mode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                  : 'border-white/15 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="hidden"
              />

              <div className="h-8 w-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-sm">
                <Upload className="h-4 w-4" />
              </div>

              <div>
                <span className="text-xs font-bold text-white block">
                  Click to select file <span className="text-slate-400 font-normal">or drag & drop</span>
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  Supports WebP, PNG, JPG, GIF, SVG (Up to 5 MB)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-bold text-white">Direct Image Web Address</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  Apply URL
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Paste any publicly accessible HTTPS image link.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Validation & Feedback Banners */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] animate-fadeIn">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] animate-fadeIn">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};

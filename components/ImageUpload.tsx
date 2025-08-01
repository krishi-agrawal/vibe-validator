'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile } from '../utils';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  isLoading?: boolean;
}

export default function ImageUpload({ onImageSelect, isLoading = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onImageSelect(file, previewUrl);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const clearImage = () => {
    setPreview(null);
    setError(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            glass-card p-8 border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragActive 
              ? 'border-purple-400 bg-purple-500/20 scale-105' 
              : 'border-white/30 hover:border-purple-400 hover:bg-white/20'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Your Space Image
              </h3>
              <p className="text-white/70 mb-4">
                {isDragActive
                  ? 'Drop your image here...'
                  : 'Drag & drop an image, or click to select'
                }
              </p>
              <p className="text-sm text-white/50">
                Supports: JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 relative">
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
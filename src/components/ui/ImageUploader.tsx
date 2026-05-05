'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/apiClient';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        // 1. Get presigned URL from our backend
        const { data } = await api.upload.getPresignedUrl(file.name, file.type);
        
        // 2. Upload directly to S3
        const uploadRes = await fetch(data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadRes.ok) throw new Error('Upload to S3 failed');

        // 3. Save the public URL
        newUrls.push(data.publicUrl);
      }

      onChange([...images, ...newUrls]);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group bg-gray-50 flex-shrink-0">
            <Image src={url} alt={`Upload ${idx}`} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 flex-shrink-0"
          >
            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-orange-500" /> : <UploadCloud className="w-6 h-6" />}
            <span className="text-xs font-medium">{uploading ? 'Uploading' : 'Add Image'}</span>
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/png, image/jpeg, image/webp"
        multiple
        className="hidden"
      />
    </div>
  );
}

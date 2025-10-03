'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface SimpleImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
}

export default function SimpleImageUploader({ 
  onImageUpload, 
  currentImageUrl, 
  folder = 'publicidad' 
}: SimpleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const data = await response.json();
      const uploadedUrl = data.url;
      
      setImageUrl(uploadedUrl);
      onImageUpload(uploadedUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onImageUpload(url);
  };

  const clearImage = () => {
    setImageUrl('');
    onImageUpload('');
  };

  return (
    <div className="space-y-4">
      {imageUrl && (
        <div className="relative">
          <div className="relative w-full h-48 border rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="file-upload">Subir desde archivo</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1"
            ref={(input) => {
              if (input) {
                (window as any).fileInput = input;
              }
            }}
          />
          <Button 
            type="button" 
            disabled={uploading} 
            variant="outline"
            onClick={() => {
              const input = document.getElementById('file-upload') as HTMLInputElement;
              input?.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Subir'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-url">O ingresa una URL</Label>
        <Input
          id="image-url"
          type="url"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>
    </div>
  );
}
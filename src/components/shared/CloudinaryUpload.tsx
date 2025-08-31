'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload, X, FileImage, FileVideo } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (result: any) => void;
  folder?: string;
  resourceType?: 'image' | 'video' | 'auto';
  maxFileSize?: number;
  multiple?: boolean;
  children?: React.ReactNode;
}

export default function CloudinaryUpload({
  onUpload,
  folder = 'uploads',
  resourceType = 'auto',
  maxFileSize = 10485760, // 10MB por defecto
  multiple = false,
  children
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (result: any) => {
    if (result.event === 'success') {
      onUpload(result.info);
      setIsUploading(false);
    }
  };

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        folder,
        resourceType,
        maxFileSize,
        multiple,
        clientAllowedFormats: resourceType === 'image' 
          ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
          : resourceType === 'video'
          ? ['mp4', 'mov', 'avi', 'webm']
          : ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
        transformation: {
          quality: 'auto',
          fetch_format: 'auto'
        }
      }}
      onUpload={handleUpload}
    >
      {({ open }) => (
        <div onClick={() => {
          setIsUploading(true);
          open();
        }}>
          {children || (
            <Button 
              type="button" 
              variant="outline" 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir {resourceType === 'image' ? 'Imagen' : resourceType === 'video' ? 'Video' : 'Archivo'}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}

// Componente para mostrar archivos subidos
interface UploadedFileProps {
  file: {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
  };
  onRemove?: () => void;
}

export function UploadedFile({ file, onRemove }: UploadedFileProps) {
  const isVideo = file.resource_type === 'video';
  const fileSize = (file.bytes / 1024 / 1024).toFixed(2);

  return (
    <div className="relative group border rounded-lg p-3 bg-card">
      <div className="flex items-center space-x-3">
        {isVideo ? (
          <FileVideo className="w-8 h-8 text-blue-500" />
        ) : (
          <FileImage className="w-8 h-8 text-green-500" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {file.public_id.split('/').pop()}.{file.format}
          </p>
          <p className="text-xs text-muted-foreground">
            {fileSize} MB • {isVideo ? 'Video' : 'Imagen'}
          </p>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import { UploadCloud, X, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ControllerRenderProps } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageUploaderProps {
  field: ControllerRenderProps<any, any>;
  multiple?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
}

export default function ImageUploader({ 
  field, 
  multiple = false, 
  existingImages = [],
  onRemoveExisting 
}: ImageUploaderProps) {
  const [removedExistingImages, setRemovedExistingImages] = useState<number[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = multiple ? [...(field.value || []), ...acceptedFiles] : acceptedFiles;
      field.onChange(newFiles);
    },
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: multiple,
  });

  const removeNewFile = (index: number) => {
    const files = field.value || [];
    const newFiles = files.filter((_: any, i: number) => i !== index);
    field.onChange(newFiles.length > 0 ? newFiles : null);
  };

  const removeExistingImage = (index: number) => {
    setRemovedExistingImages(prev => [...prev, index]);
    if (onRemoveExisting) {
      onRemoveExisting(index);
    }
  };

  const newFilesPreview = useMemo(() => {
    const files = field.value;
    if (!files || files.length === 0) return null;

    return (Array.isArray(files) ? files : [files]).map((file: File, index: number) => (
      <div key={`new-${index}`} className="relative group">
        <div className="relative w-24 h-24 border rounded-md overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt={`Nueva imagen ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeNewFile(index)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-center mt-1 text-green-600">Nueva</p>
      </div>
    ));
  }, [field.value]);

  const existingImagesPreview = useMemo(() => {
    if (!existingImages || existingImages.length === 0) return null;

    return existingImages.map((imageUrl, index) => {
      if (removedExistingImages.includes(index)) return null;
      
      return (
        <div key={`existing-${index}`} className="relative group">
          <div className="relative w-24 h-24 border rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={`Imagen actual ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.open(imageUrl, '_blank')}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeExistingImage(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-center mt-1 text-blue-600">Actual</p>
        </div>
      );
    }).filter(Boolean);
  }, [existingImages, removedExistingImages]);

  const hasImages = (existingImagesPreview && existingImagesPreview.length > 0) || 
                   (newFilesPreview && newFilesPreview.length > 0);

  return (
    <div className="space-y-4">
      {/* Mostrar imágenes existentes y nuevas */}
      {hasImages && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Imágenes:</p>
          <div className="flex flex-wrap gap-2">
            {existingImagesPreview}
            {newFilesPreview}
          </div>
        </div>
      )}

      {/* Área de subida */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="text-sm">Suelta las imágenes aquí...</p>
        ) : (
          <div>
            <p className="text-sm font-medium">
              {hasImages ? 'Añadir más imágenes' : `Subir ${multiple ? 'imágenes' : 'imagen'}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Arrastra y suelta o haz clic para seleccionar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

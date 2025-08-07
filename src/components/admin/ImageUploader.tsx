
'use client';

import { UploadCloud } from 'lucide-react';
import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { ControllerRenderProps } from 'react-hook-form';

interface ImageUploaderProps {
  field: ControllerRenderProps<any, any>;
  multiple?: boolean;
}

export default function ImageUploader({ field, multiple = false }: ImageUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // If multiple, spread existing files with new ones
      // Otherwise, just set the new file
      const newFiles = multiple ? [...(field.value || []), ...acceptedFiles] : acceptedFiles;
      field.onChange(newFiles);
    },
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: multiple,
  });

  const filesPreview = useMemo(() => {
    const files = field.value;
    if (!files || files.length === 0) return null;

    return (Array.isArray(files) ? files : [files]).map((file: File, index: number) => (
      <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
        <img
          src={URL.createObjectURL(file)}
          alt={`preview ${index}`}
          className="w-full h-full object-cover"
          onLoad={() => URL.revokeObjectURL(file.name)}
        />
      </div>
    ));
  }, [field.value]);

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        {isDragActive ? (
          <p>Suelta las imágenes aquí...</p>
        ) : (
          <p>Arrastra y suelta {multiple ? 'imágenes' : 'una imagen'} aquí, o haz clic para seleccionar</p>
        )}
      </div>
      {filesPreview && (
         <div className="mt-4 flex flex-wrap gap-2">
            {filesPreview}
        </div>
      )}
    </div>
  );
}

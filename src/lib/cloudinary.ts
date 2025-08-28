// Función para subir archivos desde el cliente usando nuestra API route
export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Utilidades para el cliente
export const getCloudinaryUrl = (publicId: string, transformations?: string) => {
  const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`;
  const transform = transformations ? `/${transformations}` : '';
  return `${baseUrl}${transform}/${publicId}`;
};

// Transformaciones comunes
export const cloudinaryTransforms = {
  thumbnail: 'w_300,h_200,c_fill,q_auto,f_auto',
  medium: 'w_800,h_600,c_fill,q_auto,f_auto',
  large: 'w_1200,h_800,c_fill,q_auto,f_auto',
  avatar: 'w_150,h_150,c_fill,g_face,q_auto,f_auto',
  video_preview: 'w_800,h_450,c_fill,q_auto,f_auto',
};
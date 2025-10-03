import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload a Cloudinary...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      console.error('❌ No se proporcionó archivo');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📁 Archivo: ${file.name}, Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB, Tipo: ${file.type}`);
    console.log(`📂 Carpeta destino: ${folder}`);

    // Verificar configuración de Cloudinary
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary no está configurado correctamente');
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration missing' },
        { status: 500 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`✅ Buffer creado: ${buffer.length} bytes`);

    // Determinar el tipo de recurso basado en la extensión
    const isModel3D = file.name.toLowerCase().endsWith('.glb') || 
                      file.name.toLowerCase().endsWith('.gltf');
    
    const resourceType = isModel3D ? 'raw' : 'auto';
    console.log(`🎯 Tipo de recurso: ${resourceType}`);

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          // Para archivos raw (como .glb), no aplicar transformaciones
          ...(resourceType === 'raw' ? {} : {
            quality: 'auto',
            fetch_format: 'auto',
          }),
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error de Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Upload exitoso:', result?.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });

    const uploadResult = result as any;

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Upload failed',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
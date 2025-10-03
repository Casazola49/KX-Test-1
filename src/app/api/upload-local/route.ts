import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Configuración para permitir archivos grandes (50MB)
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload local de modelo 3D...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'karts';

    if (!file) {
      console.error('❌ No se proporcionó archivo');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📁 Archivo: ${file.name}, Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Validar que sea un archivo .glb o .gltf
    const validExtensions = ['.glb', '.gltf'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(extension)) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten archivos .glb o .gltf' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `El archivo es muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 50MB` },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`✅ Buffer creado: ${buffer.length} bytes`);

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Ruta en el sistema de archivos (carpeta public)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filePath = path.join(uploadDir, fileName);
    
    console.log(`📂 Guardando en: ${filePath}`);

    // Crear directorio si no existe
    if (!existsSync(uploadDir)) {
      console.log('📁 Creando directorio...');
      await mkdir(uploadDir, { recursive: true });
    }

    // Guardar el archivo
    await writeFile(filePath, buffer);
    console.log('✅ Archivo guardado exitosamente');

    // URL pública (relativa a /public)
    const publicUrl = `/uploads/${folder}/${fileName}`;
    console.log('✅ URL pública:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });

  } catch (error: any) {
    console.error('❌ Error en upload:', error);
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

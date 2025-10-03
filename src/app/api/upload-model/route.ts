import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Configuración para permitir archivos grandes (50MB)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos para uploads grandes

// Inicializar Firebase Admin si no está inicializado
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload de modelo 3D a Firebase Storage...');
    
    // Verificar configuración de Firebase
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY ||
        !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      console.error('❌ Configuración de Firebase incompleta');
      return NextResponse.json(
        { success: false, error: 'Firebase configuration is incomplete' },
        { status: 500 }
      );
    }
    
    console.log('✅ Configuración de Firebase verificada');
    console.log(`📦 Storage Bucket: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`);
    
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

    // Validar tamaño (máximo 50MB para modelos 3D)
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

    // Obtener referencia al bucket de Storage
    console.log('🔧 Obteniendo referencia a Firebase Storage...');
    const storage = getStorage();
    
    let bucket;
    try {
      bucket = storage.bucket();
      console.log(`✅ Bucket obtenido: ${bucket.name}`);
    } catch (bucketError: any) {
      console.error('❌ Error obteniendo bucket:', bucketError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Firebase Storage no está configurado correctamente. Asegúrate de que Storage esté habilitado en Firebase Console.',
          details: bucketError.message
        },
        { status: 500 }
      );
    }

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}_${sanitizedFileName}`;
    const fileRef = bucket.file(fileName);

    console.log(`📂 Subiendo a: ${fileName}`);

    // Subir el archivo
    try {
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type || 'application/octet-stream',
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
      console.log('✅ Archivo subido exitosamente');
    } catch (uploadError: any) {
      console.error('❌ Error subiendo archivo:', uploadError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al subir el archivo a Firebase Storage',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // Hacer el archivo público
    try {
      await fileRef.makePublic();
      console.log('✅ Archivo hecho público');
    } catch (publicError: any) {
      console.error('⚠️ Error haciendo archivo público:', publicError);
      // Continuar de todos modos, el archivo está subido
    }

    // Obtener URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
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

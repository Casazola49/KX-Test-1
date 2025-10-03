import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const issues: string[] = [];
    
    // Verificar variables de Firebase
    if (!process.env.FIREBASE_PROJECT_ID) {
      issues.push('FIREBASE_PROJECT_ID faltante');
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      issues.push('FIREBASE_CLIENT_EMAIL faltante');
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      issues.push('FIREBASE_PRIVATE_KEY faltante');
    }
    
    // Verificar variables de Cloudinary
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      issues.push('CLOUDINARY_CLOUD_NAME faltante');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      issues.push('CLOUDINARY_API_KEY faltante');
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      issues.push('CLOUDINARY_API_SECRET faltante');
    }
    
    return NextResponse.json({
      allConfigured: issues.length === 0,
      issues,
      firebaseConfigured: !!(
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ),
      cloudinaryConfigured: !!(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      )
    });
  } catch (error) {
    return NextResponse.json({
      allConfigured: false,
      issues: ['Error verificando configuración'],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
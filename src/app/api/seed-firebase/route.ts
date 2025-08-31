// Nuevo endpoint para seeding de Firebase - Reemplaza el de Supabase
import { NextResponse } from 'next/server';
import { seedFirebaseDatabase, verifyFirebaseCollections } from '@/lib/firebase-seeding';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar que estemos en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { message: "Seeding is only available in development environment." }, 
        { status: 403 }
      );
    }

    // Ejecutar seeding
    const result = await seedFirebaseDatabase();
    
    // Verificar resultados
    const verification = await verifyFirebaseCollections();
    
    return NextResponse.json({
      ...result,
      collections: verification,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Firebase seeding failed:", error);
    return NextResponse.json(
      { 
        message: "Seeding failed", 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Endpoint para solo verificar el estado
export async function POST() {
  try {
    const verification = await verifyFirebaseCollections();
    
    return NextResponse.json({
      message: "Collections verified",
      collections: verification,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Verification failed:", error);
    return NextResponse.json(
      { 
        message: "Verification failed", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
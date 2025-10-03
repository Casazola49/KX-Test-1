import { NextResponse } from 'next/server';
import { initializeCategories, cleanupCategories, migratePilotCategories } from '@/lib/init-categories';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'init';
    
    if (action === 'cleanup') {
      await cleanupCategories();
      return NextResponse.json({ 
        success: true, 
        message: 'Categorías limpiadas correctamente' 
      });
    } else if (action === 'migrate') {
      await migratePilotCategories();
      return NextResponse.json({ 
        success: true, 
        message: 'Categorías de pilotos migradas correctamente' 
      });
    } else if (action === 'full') {
      await cleanupCategories();
      await migratePilotCategories();
      return NextResponse.json({ 
        success: true, 
        message: 'Categorías limpiadas y pilotos migrados correctamente' 
      });
    } else {
      await initializeCategories();
      return NextResponse.json({ 
        success: true, 
        message: 'Categorías inicializadas correctamente' 
      });
    }
  } catch (error) {
    console.error('Error procesando categorías:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar categorías' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Usa POST para inicializar las categorías' 
  });
}
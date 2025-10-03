import { NextRequest, NextResponse } from 'next/server';
import { getAdvertisementsBySection } from '@/app/admin/publicidad/actions';
import { Advertisement } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const type = searchParams.get('type') as 'horizontal' | 'popup' | null;

    if (!section) {
      return NextResponse.json(
        { error: 'Section parameter is required', advertisements: [] },
        { status: 400 }
      );
    }

    // Usar las acciones del servidor que sabemos que funcionan
    let advertisements = await getAdvertisementsBySection(section, type);
    
    // Si no hay anuncios específicos de la sección, buscar globales
    if (advertisements.length === 0 && section !== 'global') {
      advertisements = await getAdvertisementsBySection('global', type);
    }

    return NextResponse.json({ 
      advertisements,
      success: true,
      section,
      type,
      count: advertisements.length
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch advertisements',
        advertisements: [],
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 } // Cambiar a 200 para que no falle el fetch
    );
  }
}
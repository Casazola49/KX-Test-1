import { NextResponse } from 'next/server';
import { seedAdvertisements } from '@/scripts/seed-advertisements';

export async function POST() {
  try {
    await seedAdvertisements();
    return NextResponse.json({ 
      success: true, 
      message: 'Anuncios de ejemplo creados correctamente' 
    });
  } catch (error) {
    console.error('Error seeding advertisements:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear anuncios de ejemplo' },
      { status: 500 }
    );
  }
}
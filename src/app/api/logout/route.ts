'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Sesión cerrada.' });

    // Elimina la cookie estableciendo su maxAge a -1
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1, // Instrucción para que el navegador la elimine
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error en la ruta API de logout:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado.' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, message: 'Sesión iniciada.' });

    // Establece la cookie HttpOnly, segura.
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_WEEK_IN_SECONDS,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error en la ruta API de login:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

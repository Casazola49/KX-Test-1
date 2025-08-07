
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin-token')?.value;

  // Si el usuario intenta acceder a cualquier ruta de admin sin el token,
  // redirígelo a la página de login.
  if (!adminToken) {
    // Redirigir a la página de login, manteniendo los posibles parámetros de búsqueda.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado, permite el acceso.
  return NextResponse.next();
}

// Especifica qué rutas debe proteger este middleware.
export const config = {
  matcher: '/admin/:path*',
};

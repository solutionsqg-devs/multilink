import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para proteger rutas
 * - Rutas /dashboard/* requieren autenticación
 * - Rutas /login y /register redirigen a /dashboard si ya está autenticado
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas de dashboard (protegidas)
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Rutas de autenticación
  const isAuthPath = pathname === '/login' || pathname === '/register';

  // Verificar si tiene cookies de sesión
  const hasAccessToken = request.cookies.has('access_token');
  const hasRefreshToken = request.cookies.has('refresh_token');
  const hasAuthCookie = hasAccessToken || hasRefreshToken;

  // Si es ruta de dashboard sin auth, redirigir a login
  if (isDashboardPath && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Si está en login/register con auth, redirigir a dashboard
  if (isAuthPath && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (archivos estáticos)
     * - api routes
     * - Rutas dinámicas [username] (perfiles públicos)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};

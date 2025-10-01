'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <main className="max-w-4xl text-center">
        <h1 className="text-6xl font-bold text-gray-900 sm:text-7xl">MultiEnlace</h1>
        <p className="mt-6 text-xl text-gray-600 sm:text-2xl">
          Tu página de enlaces personalizada con analíticas y temas
        </p>
        <p className="mt-4 text-lg text-gray-500">
          Similar a Linktree, pero con más opciones de personalización
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Comenzar Gratis
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Iniciar Sesión
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-4xl">🔗</div>
            <h3 className="mt-4 font-semibold text-gray-900">Enlaces Ilimitados</h3>
            <p className="mt-2 text-sm text-gray-600">Agrega todos los enlaces que necesites</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-4xl">📊</div>
            <h3 className="mt-4 font-semibold text-gray-900">Analíticas</h3>
            <p className="mt-2 text-sm text-gray-600">Rastrea clicks y comportamiento</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-4xl">🎨</div>
            <h3 className="mt-4 font-semibold text-gray-900">Personalización</h3>
            <p className="mt-2 text-sm text-gray-600">Temas, colores y dominios propios</p>
          </div>
        </div>
      </main>
    </div>
  );
}

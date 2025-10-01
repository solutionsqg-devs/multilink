'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  if (!user) return null;

  // Valores por defecto para features si es null
  const features = user.features || {
    domains: false,
    advancedAnalytics: false,
    ogImage: false,
    removeBranding: false,
    extraThemes: false,
  };

  // Cargar el username del perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/profiles/me');
        setUsername(response.data.username);
      } catch (err) {
        // Si no hay perfil, usar el email como username temporal
        setUsername(user.email.split('@')[0]);
      }
    };
    loadProfile();
  }, [user.email]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">¡Hola, {user.name || 'Bienvenido'}! 👋</h1>
        <p className="mt-2 text-gray-600">Gestiona tus enlaces y personaliza tu perfil público</p>
      </div>

      {/* Plan FREE Alert */}
      {user.plan === 'FREE' && (
        <Alert>
          <AlertTitle>Plan Gratuito</AlertTitle>
          <AlertDescription>
            Estás usando el plan gratuito. Actualiza a Pro para desbloquear analytics avanzado,
            dominios personalizados y más.{' '}
            <Link href="/pricing" className="font-medium text-blue-600 hover:underline">
              Ver planes
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Enlaces Activos</CardTitle>
            <CardDescription className="text-3xl font-bold text-gray-900">0</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Crea tu primer enlace para comenzar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Clicks Totales</CardTitle>
            <CardDescription className="text-3xl font-bold text-gray-900">0</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {user.plan === 'FREE' ? 'Estadísticas básicas' : 'Estadísticas avanzadas disponibles'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Plan Actual</CardTitle>
            <CardDescription className="text-3xl font-bold text-gray-900">
              {user.plan}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.plan === 'FREE' ? (
              <Link href="/pricing">
                <Button size="sm" className="w-full">
                  Actualizar a Pro
                </Button>
              </Link>
            ) : (
              <p className="text-sm text-green-600">✓ Todas las funciones</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Comienza a personalizar tu perfil y agregar enlaces</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/links" className="flex-1">
            <Button className="w-full">Agregar Enlace</Button>
          </Link>
          <Link href="/dashboard/profile" className="flex-1">
            <Button variant="outline" className="w-full">
              Editar Perfil
            </Button>
          </Link>
          {username && (
            <Link href={`/${username}`} className="flex-1" target="_blank">
              <Button variant="outline" className="w-full">
                Ver Perfil Público
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Features by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Funciones de tu Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <span className="mr-2 text-green-600">✓</span>
              Enlaces ilimitados
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 text-green-600">✓</span>
              Analítica básica
            </li>
            <li className="flex items-center text-sm">
              <span className={`mr-2 ${features.domains ? 'text-green-600' : 'text-gray-400'}`}>
                {features.domains ? '✓' : '✕'}
              </span>
              <span className={features.domains ? '' : 'text-gray-400'}>Dominio personalizado</span>
            </li>
            <li className="flex items-center text-sm">
              <span
                className={`mr-2 ${features.advancedAnalytics ? 'text-green-600' : 'text-gray-400'}`}
              >
                {features.advancedAnalytics ? '✓' : '✕'}
              </span>
              <span className={features.advancedAnalytics ? '' : 'text-gray-400'}>
                Analítica avanzada
              </span>
            </li>
            <li className="flex items-center text-sm">
              <span
                className={`mr-2 ${features.removeBranding ? 'text-green-600' : 'text-gray-400'}`}
              >
                {features.removeBranding ? '✓' : '✕'}
              </span>
              <span className={features.removeBranding ? '' : 'text-gray-400'}>
                Sin marca MultiEnlace
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

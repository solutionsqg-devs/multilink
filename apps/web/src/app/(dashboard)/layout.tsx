'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              MultiEnlace
            </Link>

            {/* Navigation */}
            <nav className="hidden space-x-8 md:flex">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/links"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Mis Enlaces
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Mi Perfil
              </Link>
              {user.plan === 'PRO' && (
                <Link
                  href="/dashboard/analytics"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Analytics
                </Link>
              )}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden text-sm md:block">
                <p className="font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">
                  Plan: {user.plan}
                  {user.plan === 'FREE' && (
                    <Link
                      href="/pricing"
                      className="ml-2 font-medium text-blue-600 hover:underline"
                    >
                      Upgrade
                    </Link>
                  )}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

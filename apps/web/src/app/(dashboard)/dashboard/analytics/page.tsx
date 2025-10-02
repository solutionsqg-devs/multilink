'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnalyticsOverview {
  totalLinks: number;
  totalClicks: number;
  topLinks: Array<{
    id: string;
    title: string;
    url: string;
    clickCount: number;
  }>;
  profileViews?: number;
  clicksLast7Days?: number;
  clicksByDay?: Array<{ date: string; count: number }>;
  topReferrers?: Array<{ referer: string; count: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.plan === 'PRO' && user?.features?.advancedAnalytics;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<AnalyticsOverview>('/analytics/overview');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || 'No se pudieron cargar las analíticas'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
        <p className="mt-2 text-gray-600">
          {isPro ? 'Analíticas avanzadas de tu perfil' : 'Vista general de tus enlaces'}
        </p>
      </div>

      {/* Plan FREE Alert */}
      {!isPro && (
        <Alert>
          <AlertTitle>Plan Gratuito - Analytics Básico</AlertTitle>
          <AlertDescription>
            Actualiza a Pro para desbloquear analytics avanzado: clicks por día, referrers,
            dispositivos y más.{' '}
            <Link href="/pricing" className="font-medium text-blue-600 hover:underline">
              Ver planes
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Enlaces Totales</CardTitle>
            <CardDescription className="text-3xl font-bold text-gray-900">
              {data.totalLinks}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Enlaces activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Clicks Totales</CardTitle>
            <CardDescription className="text-3xl font-bold text-gray-900">
              {data.totalClicks.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">En todos tus enlaces</p>
          </CardContent>
        </Card>

        {isPro && data.profileViews !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Vistas de Perfil</CardTitle>
              <CardDescription className="text-3xl font-bold text-gray-900">
                {data.profileViews.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Visitas a tu página pública</p>
            </CardContent>
          </Card>
        )}

        {isPro && data.clicksLast7Days !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Clicks (últimos 7 días)
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-gray-900">
                {data.clicksLast7Days.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Clicks recientes</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PRO: Clicks por día */}
      {isPro && data.clicksByDay && data.clicksByDay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clicks por Día (últimos 30 días)</CardTitle>
            <CardDescription>Evolución de clicks en el tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.clicksByDay.map(d => ({
                  ...d,
                  date: format(parseISO(d.date), 'dd MMM', { locale: es }),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Links */}
      {data.topLinks && data.topLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Enlaces más Clickeados</CardTitle>
            <CardDescription>Links con más interacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topLinks.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clickCount" fill="#8b5cf6" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* PRO: Top Referrers */}
      {isPro && data.topReferrers && data.topReferrers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers (últimos 30 días)</CardTitle>
            <CardDescription>De dónde vienen tus visitantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Gráfico circular */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.topReferrers.slice(0, 6)}
                    dataKey="count"
                    nameKey="referer"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.topReferrers.slice(0, 6).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Lista */}
              <div className="space-y-3">
                {data.topReferrers.slice(0, 10).map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="truncate font-medium text-gray-900">
                        {ref.referer || 'Direct'}
                      </p>
                    </div>
                    <span className="ml-4 font-bold text-blue-600">{ref.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Enlaces</CardTitle>
          <CardDescription>Clicks por enlace individual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium text-gray-600">Título</th>
                  <th className="pb-3 text-left font-medium text-gray-600">URL</th>
                  <th className="pb-3 text-right font-medium text-gray-600">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.topLinks.map(link => (
                  <tr key={link.id} className="border-b">
                    <td className="py-3 font-medium text-gray-900">{link.title}</td>
                    <td className="py-3 text-gray-600">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-blue-600 hover:underline"
                      >
                        {link.url.substring(0, 50)}
                        {link.url.length > 50 ? '...' : ''}
                      </a>
                    </td>
                    <td className="py-3 text-right font-bold text-blue-600">{link.clickCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CTA para Pro */}
      {!isPro && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">🚀 Desbloquea Analytics Avanzado</CardTitle>
            <CardDescription className="text-blue-700">Con el plan Pro obtienes:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-center">
                <span className="mr-2 text-green-600">✓</span>
                Clicks por día (gráficos de tendencias)
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-green-600">✓</span>
                Top referrers (de dónde vienen tus visitantes)
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-green-600">✓</span>
                Análisis de dispositivos (móvil, desktop, tablet)
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-green-600">✓</span>
                Retención de datos hasta 12 meses
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-green-600">✓</span>
                Analytics individuales por link
              </li>
            </ul>
            <Link href="/pricing">
              <Button className="w-full">Actualizar a Pro</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/axios';
import { useAuth } from '@/contexts/auth-context';
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiUser, FiEye, FiLock, FiExternalLink } from 'react-icons/fi';

interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  theme: string;
  customCss: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  customDomain: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Cargar perfil
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get('/profiles/me');
      setProfile(response.data);
      setHasProfile(true);
      reset({
        username: response.data.username,
        displayName: response.data.displayName,
        bio: response.data.bio || '',
        avatar: response.data.avatar || '',
        theme: response.data.theme,
        customCss: response.data.customCss || '',
        metaTitle: response.data.metaTitle || '',
        metaDescription: response.data.metaDescription || '',
        ogImage: response.data.ogImage || '',
        customDomain: response.data.customDomain || '',
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasProfile(false);
        // Perfil no existe, mostrar formulario vacío
        reset({
          username: '',
          displayName: user?.name || '',
          bio: '',
          avatar: '',
          theme: 'default',
          customCss: '',
          metaTitle: '',
          metaDescription: '',
          ogImage: '',
          customDomain: '',
        });
      } else {
        setError(err.response?.data?.message || 'Error al cargar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    setSuccess(false);

    try {
      // Filtrar campos según el plan del usuario
      const allowedData: any = {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio || null,
        avatar: data.avatar || null,
        theme: data.theme,
      };

      // Solo incluir campos PRO si el usuario es PRO
      const features = user?.features || {};
      if (features.ogImage) {
        allowedData.customCss = data.customCss || null;
        allowedData.metaTitle = data.metaTitle || null;
        allowedData.metaDescription = data.metaDescription || null;
        allowedData.ogImage = data.ogImage || null;
      }
      if (features.domains) {
        allowedData.customDomain = data.customDomain || null;
      }

      if (hasProfile && profile) {
        // Actualizar
        const response = await apiClient.patch(`/profiles/${profile.id}`, allowedData);
        setProfile(response.data);
      } else {
        // Crear
        const response = await apiClient.post('/profiles', allowedData);
        setProfile(response.data);
        setHasProfile(true);
      }
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar perfil');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isPro = user?.plan === 'PRO';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-2 text-gray-600">Personaliza tu página pública</p>
        </div>
        {hasProfile && (
          <a
            href={`/@${profile?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FiEye size={16} />
            Ver Perfil Público
            <FiExternalLink size={14} />
          </a>
        )}
      </div>

      {success && (
        <Alert variant="success">
          <AlertDescription>✓ Perfil actualizado correctamente</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiUser size={20} />
              Información Básica
            </CardTitle>
            <CardDescription>Datos públicos de tu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="username">Usuario (URL) *</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-gray-500">@</span>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="miusuario"
                    disabled={hasProfile}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
                {hasProfile && (
                  <p className="mt-1 text-xs text-gray-500">El username no se puede cambiar</p>
                )}
                {!hasProfile && (
                  <p className="mt-1 text-xs text-gray-500">
                    Tu perfil será multienlace.com/@{'{username}'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="displayName">Nombre para mostrar *</Label>
                <Input id="displayName" {...register('displayName')} placeholder="Juan Pérez" />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
              />
              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
            </div>

            <div>
              <Label htmlFor="avatar">URL de Avatar</Label>
              <Input id="avatar" {...register('avatar')} placeholder="https://..." />
              {errors.avatar && (
                <p className="mt-1 text-sm text-red-600">{errors.avatar.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Imagen cuadrada recomendada (ej: 400x400px)
              </p>
            </div>

            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select id="theme" {...register('theme')}>
                <option value="default">Por Defecto</option>
                <option value="dark">Oscuro</option>
                <option value="modern">Moderno</option>
                <option value="minimal">Minimalista</option>
              </Select>
              {errors.theme && <p className="mt-1 text-sm text-red-600">{errors.theme.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* SEO (Pro) */}
        <Card className={!isPro ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  SEO y Meta Tags
                  {!isPro && <FiLock size={16} className="text-gray-400" />}
                </CardTitle>
                <CardDescription>
                  {isPro ? 'Optimiza tu perfil para buscadores' : 'Actualiza a Pro para acceder'}
                </CardDescription>
              </div>
              {!isPro && (
                <Button type="button" size="sm" variant="outline">
                  Upgrade a Pro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Título</Label>
              <Input
                id="metaTitle"
                {...register('metaTitle')}
                placeholder="Tu Nombre - Título Profesional"
                disabled={!isPro}
              />
              {errors.metaTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Máximo 60 caracteres</p>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Descripción</Label>
              <Textarea
                id="metaDescription"
                {...register('metaDescription')}
                placeholder="Breve descripción para buscadores..."
                rows={3}
                disabled={!isPro}
              />
              {errors.metaDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Máximo 160 caracteres</p>
            </div>

            <div>
              <Label htmlFor="ogImage">Imagen Open Graph</Label>
              <Input
                id="ogImage"
                {...register('ogImage')}
                placeholder="https://..."
                disabled={!isPro}
              />
              {errors.ogImage && (
                <p className="mt-1 text-sm text-red-600">{errors.ogImage.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                1200x630px recomendado para redes sociales
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dominio Personalizado (Pro) */}
        <Card className={!isPro ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Dominio Personalizado
                  {!isPro && <FiLock size={16} className="text-gray-400" />}
                </CardTitle>
                <CardDescription>
                  {isPro ? 'Usa tu propio dominio' : 'Actualiza a Pro para acceder'}
                </CardDescription>
              </div>
              {!isPro && (
                <Button type="button" size="sm" variant="outline">
                  Upgrade a Pro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Label htmlFor="customDomain">Dominio</Label>
            <Input
              id="customDomain"
              {...register('customDomain')}
              placeholder="links.tudominio.com"
              disabled={!isPro}
            />
            {errors.customDomain && (
              <p className="mt-1 text-sm text-red-600">{errors.customDomain.message}</p>
            )}
            {isPro && (
              <p className="mt-1 text-xs text-gray-500">
                Configura un registro CNAME apuntando a multienlace.com
              </p>
            )}
          </CardContent>
        </Card>

        {/* CSS Personalizado (Pro) */}
        <Card className={!isPro ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  CSS Personalizado
                  {!isPro && <FiLock size={16} className="text-gray-400" />}
                </CardTitle>
                <CardDescription>
                  {isPro ? 'Agrega estilos personalizados' : 'Actualiza a Pro para acceder'}
                </CardDescription>
              </div>
              {!isPro && (
                <Button type="button" size="sm" variant="outline">
                  Upgrade a Pro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              id="customCss"
              {...register('customCss')}
              placeholder=".profile { background: linear-gradient(...); }"
              rows={6}
              disabled={!isPro}
              className="font-mono text-sm"
            />
            {errors.customCss && (
              <p className="mt-1 text-sm text-red-600">{errors.customCss.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          {hasProfile && (
            <Button type="button" variant="outline" onClick={loadProfile}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : hasProfile ? 'Actualizar Perfil' : 'Crear Perfil'}
          </Button>
        </div>
      </form>
    </div>
  );
}

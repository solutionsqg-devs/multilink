import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiExternalLink } from 'react-icons/fi';
import { ViewTracker } from '@/components/view-tracker';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Forzar renderizado dinámico para evitar errores en build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

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
  viewCount: number;
  user: {
    name: string | null;
    plan: 'FREE' | 'PRO';
    features: {
      removeBranding: boolean;
    };
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    description: string | null;
    icon: string | null;
    clickCount: number;
  }>;
}

async function getProfile(username: string): Promise<Profile | null> {
  try {
    const response = await fetch(`${API_URL}/profiles/username/${username}`, {
      next: {
        revalidate: 60, // ISR: revalidar cada 60 segundos
        tags: [`profile-${username}`], // Para revalidación on-demand
      },
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return {
      title: 'Usuario no encontrado',
    };
  }

  return {
    title: profile.metaTitle || `${profile.displayName} - MultiEnlace`,
    description:
      profile.metaDescription || profile.bio || `Perfil de ${profile.displayName} en MultiEnlace`,
    openGraph: {
      title: profile.metaTitle || profile.displayName,
      description: profile.metaDescription || profile.bio || '',
      images: profile.ogImage ? [profile.ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: profile.metaTitle || profile.displayName,
      description: profile.metaDescription || profile.bio || '',
      images: profile.ogImage ? [profile.ogImage] : [],
    },
  };
}

export default async function ProfilePublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  const showBranding = !profile.user.features.removeBranding;

  return (
    <>
      {/* View Tracker */}
      <ViewTracker username={username} />

      {/* Custom CSS */}
      {profile.customCss && <style dangerouslySetInnerHTML={{ __html: profile.customCss }} />}

      <div
        className={`min-h-screen ${getThemeClasses(profile.theme)}`}
        style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
      >
        <div className="mx-auto max-w-2xl px-4">
          {/* Avatar y Header */}
          <div className="text-center">
            {profile.avatar ? (
              <div className="relative mx-auto h-24 w-24">
                <Image
                  src={profile.avatar}
                  alt={profile.displayName}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white shadow-lg object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="mx-auto h-24 w-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h1 className={`mt-4 text-3xl font-bold ${getTextStyles(profile.theme)}`}>
              {profile.displayName}
            </h1>
            {profile.bio && (
              <p
                className={`mt-2 max-w-md mx-auto ${profile.theme === 'dark' || profile.theme === 'gradient' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {profile.bio}
              </p>
            )}
            <p
              className={`mt-1 text-sm ${profile.theme === 'dark' || profile.theme === 'gradient' ? 'text-gray-400' : 'text-gray-400'}`}
            >
              @{profile.username}
            </p>
          </div>

          {/* Links */}
          <div className="mt-8 space-y-3">
            {profile.links.map((link, index) => (
              <a
                key={link.id}
                href={`${API_URL}/links/${link.id}/click`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block w-full rounded-lg border-2 p-4 text-center transition-all hover:shadow-lg hover:scale-[1.02] ${getLinkStyles(profile.theme)}`}
                style={{
                  animation: `fadeInUp 0.${index + 3}s ease-out`,
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium group-hover:scale-105 transition-transform">
                    {link.title}
                  </span>
                  <FiExternalLink
                    size={16}
                    className={`${profile.theme === 'dark' || profile.theme === 'gradient' ? 'text-gray-400' : 'text-gray-400'} group-hover:translate-x-1 transition-transform`}
                  />
                </div>
                {link.description && (
                  <p
                    className={`mt-1 text-sm ${profile.theme === 'dark' || profile.theme === 'gradient' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {link.description}
                  </p>
                )}
              </a>
            ))}
          </div>

          {profile.links.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
              <p>No hay enlaces disponibles</p>
            </div>
          )}

          {/* Branding */}
          {showBranding && (
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600"
              >
                Creado con <span className="font-semibold">MultiEnlace</span>
              </Link>
            </div>
          )}

          {/* Stats (ocultos, solo para tracking) */}
          <div className="mt-8 text-center text-xs text-gray-400">{profile.viewCount} visitas</div>
        </div>
      </div>
    </>
  );
}

function getThemeClasses(theme: string): string {
  switch (theme) {
    case 'dark':
      return 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white';
    case 'modern':
      return 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50';
    case 'gradient':
      return 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white';
    case 'minimal':
      return 'bg-gray-50';
    default:
      return 'bg-white';
  }
}

function getLinkStyles(theme: string): string {
  switch (theme) {
    case 'dark':
      return 'border-gray-700 bg-gray-800 text-white hover:border-blue-500 hover:bg-gray-700';
    case 'gradient':
      return 'border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20';
    case 'modern':
      return 'border-purple-200 bg-white hover:border-purple-500 hover:shadow-purple-200/50';
    default:
      return 'border-gray-200 bg-white hover:border-blue-600';
  }
}

function getTextStyles(theme: string): string {
  switch (theme) {
    case 'dark':
      return 'text-white';
    case 'gradient':
      return 'text-white';
    default:
      return 'text-gray-900';
  }
}

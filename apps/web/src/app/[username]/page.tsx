import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      next: { revalidate: 60 }, // ISR: revalidar cada 60 segundos
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
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
      {/* Custom CSS */}
      {profile.customCss && <style dangerouslySetInnerHTML={{ __html: profile.customCss }} />}

      <div
        className={`min-h-screen ${getThemeClasses(profile.theme)}`}
        style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
      >
        <div className="mx-auto max-w-2xl px-4">
          {/* Avatar y Header */}
          <div className="text-center">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="mx-auto h-24 w-24 rounded-full border-4 border-white shadow-lg"
              />
            )}
            <h1 className="mt-4 text-3xl font-bold text-gray-900">{profile.displayName}</h1>
            {profile.bio && <p className="mt-2 text-gray-600 max-w-md mx-auto">{profile.bio}</p>}
            <p className="mt-1 text-sm text-gray-400">@{profile.username}</p>
          </div>

          {/* Links */}
          <div className="mt-8 space-y-3">
            {profile.links.map(link => (
              <a
                key={link.id}
                href={`${API_URL}/links/${link.id}/click`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full rounded-lg border-2 border-gray-200 bg-white p-4 text-center transition-all hover:border-blue-600 hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">
                    {link.title}
                  </span>
                  <FiExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                {link.description && (
                  <p className="mt-1 text-sm text-gray-500">{link.description}</p>
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
      return 'bg-gray-900 text-white';
    case 'modern':
      return 'bg-gradient-to-br from-purple-50 to-blue-50';
    case 'minimal':
      return 'bg-gray-50';
    default:
      return 'bg-white';
  }
}

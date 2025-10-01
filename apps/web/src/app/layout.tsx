import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MultiEnlace - Tu página de enlaces personalizada',
  description: 'Crea tu página de enlaces personalizada con analíticas avanzadas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}

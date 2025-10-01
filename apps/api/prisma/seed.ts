import { PrismaClient, Plan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.clickEvent.deleteMany();
    await prisma.link.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  }

  // ============================================
  // USUARIO FREE
  // ============================================
  const passwordHash = await bcrypt.hash('password123', 10);

  const userFree = await prisma.user.create({
    data: {
      email: 'demo@multienlace.com',
      password: passwordHash,
      name: 'Demo User',
      plan: Plan.FREE,
      features: {
        domains: false,
        advancedAnalytics: false,
        ogImage: false,
        removeBranding: false,
        extraThemes: false,
      },
      profile: {
        create: {
          username: 'demo',
          displayName: 'Demo User - Free Plan',
          bio: 'Esta es una cuenta de demostración del plan gratuito de MultiEnlace. ¡Crea tu propia página de enlaces personalizada!',
          theme: 'default',
          metaTitle: 'Demo User - MultiEnlace',
          metaDescription: 'Mi página de enlaces personalizada con MultiEnlace',
          links: {
            create: [
              {
                title: 'Mi Sitio Web',
                url: 'https://example.com',
                description: 'Visita mi sitio web oficial',
                position: 0,
                isActive: true,
              },
              {
                title: 'GitHub',
                url: 'https://github.com',
                description: 'Sígueme en GitHub',
                icon: 'github',
                position: 1,
                isActive: true,
              },
              {
                title: 'Twitter',
                url: 'https://twitter.com',
                description: 'Sígueme en Twitter',
                icon: 'twitter',
                position: 2,
                isActive: true,
              },
              {
                title: 'LinkedIn',
                url: 'https://linkedin.com',
                description: 'Conéctate conmigo en LinkedIn',
                icon: 'linkedin',
                position: 3,
                isActive: true,
              },
            ],
          },
        },
      },
    },
    include: {
      profile: {
        include: {
          links: true,
        },
      },
    },
  });

  console.log('✅ Created FREE user:', {
    email: userFree.email,
    username: userFree.profile?.username,
    plan: userFree.plan,
    linksCount: userFree.profile?.links.length,
  });

  // ============================================
  // USUARIO PRO
  // ============================================
  const userPro = await prisma.user.create({
    data: {
      email: 'pro@multienlace.com',
      password: passwordHash,
      name: 'Pro User',
      plan: Plan.PRO,
      features: {
        domains: true,
        advancedAnalytics: true,
        ogImage: true,
        removeBranding: true,
        extraThemes: true,
      },
      profile: {
        create: {
          username: 'prouser',
          displayName: 'Pro User - Premium',
          bio: '🚀 Cuenta PRO con todas las funcionalidades premium. Analytics avanzados, dominio personalizado, sin branding.',
          theme: 'premium',
          customDomain: 'pro.multienlace.com',
          metaTitle: 'Pro User - MultiEnlace Premium',
          metaDescription: 'Perfil premium con todas las funcionalidades avanzadas',
          ogImage: 'https://example.com/og-image.jpg',
          links: {
            create: [
              {
                title: 'Portfolio Premium',
                url: 'https://portfolio.example.com',
                description: 'Mi portfolio profesional',
                position: 0,
                isActive: true,
              },
              {
                title: 'Blog Personal',
                url: 'https://blog.example.com',
                description: 'Lee mis últimos artículos',
                position: 1,
                isActive: true,
              },
              {
                title: 'Tienda Online',
                url: 'https://shop.example.com',
                description: 'Compra mis productos',
                icon: 'shop',
                position: 2,
                isActive: true,
              },
              {
                title: 'YouTube Channel',
                url: 'https://youtube.com',
                description: 'Suscríbete a mi canal',
                icon: 'youtube',
                position: 3,
                isActive: true,
              },
              {
                title: 'Contacto',
                url: 'mailto:pro@example.com',
                description: 'Envíame un email',
                position: 4,
                isActive: true,
              },
            ],
          },
        },
      },
    },
    include: {
      profile: {
        include: {
          links: true,
        },
      },
    },
  });

  console.log('✅ Created PRO user:', {
    email: userPro.email,
    username: userPro.profile?.username,
    plan: userPro.plan,
    linksCount: userPro.profile?.links.length,
  });

  // ============================================
  // CLICK EVENTS (Datos de ejemplo)
  // ============================================
  const demoLinks = await prisma.link.findMany({
    where: {
      profile: {
        username: 'demo',
      },
    },
    take: 2,
  });

  if (demoLinks.length > 0) {
    const clickEvents = [];
    const countries = ['MX', 'US', 'ES', 'AR', 'CO'];
    const devices = ['mobile', 'desktop', 'tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];

    for (const link of demoLinks) {
      // Generar 10-30 clicks por link
      const clickCount = Math.floor(Math.random() * 20) + 10;

      for (let i = 0; i < clickCount; i++) {
        clickEvents.push({
          linkId: link.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: `Mozilla/5.0 (${devices[Math.floor(Math.random() * devices.length)]})`,
          country: countries[Math.floor(Math.random() * countries.length)],
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          clickedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        });
      }
    }

    await prisma.clickEvent.createMany({
      data: clickEvents,
    });

    // Actualizar contadores de clicks
    for (const link of demoLinks) {
      const count = await prisma.clickEvent.count({
        where: { linkId: link.id },
      });
      await prisma.link.update({
        where: { id: link.id },
        data: { clickCount: count },
      });
    }

    console.log(`✅ Created ${clickEvents.length} click events`);
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Users:');
  console.log('  FREE: demo@multienlace.com / password123');
  console.log('  PRO:  pro@multienlace.com / password123');
  console.log('\n🔗 Test Profiles:');
  console.log('  FREE: http://localhost:3000/@demo');
  console.log('  PRO:  http://localhost:3000/@prouser');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

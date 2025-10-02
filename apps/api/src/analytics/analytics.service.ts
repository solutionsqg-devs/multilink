import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Overview general del usuario (FREE y PRO)
   */
  async getOverview(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Total de links
    const totalLinks = await this.prisma.link.count({
      where: { profile: { userId } },
    });

    // Total de clicks
    const totalClicks = await this.prisma.link.aggregate({
      where: { profile: { userId } },
      _sum: { clickCount: true },
    });

    // Clicks por link (top 10)
    const topLinks = await this.prisma.link.findMany({
      where: { profile: { userId }, isActive: true },
      orderBy: { clickCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        url: true,
        clickCount: true,
      },
    });

    const overview = {
      totalLinks,
      totalClicks: totalClicks._sum.clickCount || 0,
      topLinks,
    };

    // Si es PRO, agregar métricas avanzadas
    const features = user.features as any;
    if (user.plan === 'PRO' && features?.advancedAnalytics) {
      const profileViews = user.profile?.viewCount || 0;

      // Clicks en los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const clicksLast7Days = await this.prisma.clickEvent.count({
        where: {
          link: { profile: { userId } },
          clickedAt: { gte: sevenDaysAgo },
        },
      });

      // Clicks por día (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const clicksByDay = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("clicked_at") as date, COUNT(*)::int as count
        FROM "ClickEvent"
        WHERE "linkId" IN (
          SELECT l.id FROM "Link" l
          INNER JOIN "Profile" p ON l."profileId" = p.id
          WHERE p."userId" = ${userId}
        )
        AND "clicked_at" >= ${thirtyDaysAgo}
        GROUP BY DATE("clicked_at")
        ORDER BY date DESC
      `;

      // Top referrers (últimos 30 días)
      const topReferrers = await this.prisma.clickEvent.groupBy({
        by: ['referer'],
        where: {
          link: { profile: { userId } },
          clickedAt: { gte: thirtyDaysAgo },
          referer: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      });

      return {
        ...overview,
        profileViews,
        clicksLast7Days,
        clicksByDay: clicksByDay.map(row => ({
          date: row.date,
          count: Number(row.count),
        })),
        topReferrers: topReferrers.map(r => ({
          referer: r.referer || 'Direct',
          count: r._count?.id || 0,
        })),
      };
    }

    return overview;
  }

  /**
   * Analytics de un link específico
   */
  async getLinkAnalytics(linkId: string, userId: string) {
    const link = await this.prisma.link.findUnique({
      where: { id: linkId },
      include: { profile: { include: { user: true } } },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const user = link.profile.user;

    // Métricas básicas (FREE y PRO)
    const basicStats = {
      linkId: link.id,
      title: link.title,
      url: link.url,
      totalClicks: link.clickCount,
    };

    // Si es FREE, solo devolver lo básico
    const features = user.features as any;
    if (user.plan === 'FREE' || !features?.advancedAnalytics) {
      return basicStats;
    }

    // Métricas avanzadas (PRO)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clicks por día
    const clicksByDay = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("clicked_at") as date, COUNT(*)::int as count
      FROM "ClickEvent"
      WHERE "linkId" = ${linkId}
      AND "clicked_at" >= ${thirtyDaysAgo}
      GROUP BY DATE("clicked_at")
      ORDER BY date DESC
    `;

    // Top referrers
    const topReferrers = await this.prisma.clickEvent.groupBy({
      by: ['referer'],
      where: {
        linkId,
        clickedAt: { gte: thirtyDaysAgo },
        referer: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // User agents (dispositivos)
    const userAgents = await this.prisma.clickEvent.findMany({
      where: {
        linkId,
        clickedAt: { gte: thirtyDaysAgo },
      },
      select: { userAgent: true },
      take: 100,
    });

    // Clasificar dispositivos (simplificado)
    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
      unknown: 0,
    };

    userAgents.forEach(ua => {
      const agent = (ua.userAgent || '').toLowerCase();
      if (agent.includes('mobile') || agent.includes('android') || agent.includes('iphone')) {
        devices.mobile++;
      } else if (agent.includes('tablet') || agent.includes('ipad')) {
        devices.tablet++;
      } else if (
        agent.includes('mozilla') ||
        agent.includes('chrome') ||
        agent.includes('safari')
      ) {
        devices.desktop++;
      } else {
        devices.unknown++;
      }
    });

    return {
      ...basicStats,
      clicksByDay: clicksByDay.map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
      topReferrers: topReferrers.map(r => ({
        referer: r.referer || 'Direct',
        count: r._count?.id || 0,
      })),
      devices,
    };
  }
}

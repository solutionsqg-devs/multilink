import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createLinkDto: CreateLinkDto) {
    // Verificar que el usuario tenga un perfil
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found. Create a profile first.');
    }

    // Obtener la siguiente posición
    const maxPosition = await this.prisma.link.findFirst({
      where: { profileId: profile.id },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = maxPosition ? maxPosition.position + 1 : 0;

    return this.prisma.link.create({
      data: {
        ...createLinkDto,
        profileId: profile.id,
        position: createLinkDto.position ?? nextPosition,
      },
    });
  }

  async findAll(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.link.findMany({
      where: { profileId: profile.id },
      orderBy: { position: 'asc' },
    });
  }

  async findAllByProfile(profileId: string, includeInactive = false) {
    return this.prisma.link.findMany({
      where: {
        profileId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // Verificar que el link pertenezca al usuario
    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    return link;
  }

  async update(id: string, userId: string, updateLinkDto: UpdateLinkDto) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.prisma.link.update({
      where: { id },
      data: updateLinkDto,
    });
  }

  async reorder(userId: string, reorderDto: ReorderLinksDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Verificar que todos los links pertenezcan al perfil del usuario
    const links = await this.prisma.link.findMany({
      where: {
        id: { in: reorderDto.linkIds },
        profileId: profile.id,
      },
    });

    if (links.length !== reorderDto.linkIds.length) {
      throw new ForbiddenException('Some links do not belong to your profile');
    }

    // Actualizar posiciones
    const updates = reorderDto.linkIds.map((linkId, index) =>
      this.prisma.link.update({
        where: { id: linkId },
        data: { position: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findAll(userId);
  }

  async remove(id: string, userId: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Soft delete
    return this.prisma.link.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async hardDelete(id: string, userId: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.prisma.link.delete({
      where: { id },
    });
  }

  async incrementClickCount(linkId: string) {
    return this.prisma.link.update({
      where: { id: linkId },
      data: {
        clickCount: { increment: 1 },
      },
    });
  }

  async trackClick(id: string, trackingData: { ip: string; userAgent: string; referer: string }) {
    const link = await this.prisma.link.findUnique({
      where: { id, isActive: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // Incrementar contador en Link
    await this.prisma.link.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    // Guardar ClickEvent para analytics
    await this.prisma.clickEvent.create({
      data: {
        linkId: id,
        ip: trackingData.ip || null,
        userAgent: trackingData.userAgent || null,
        referer: trackingData.referer || null,
        timestamp: new Date(),
      },
    });

    return link;
  }
}

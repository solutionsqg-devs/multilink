import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProfileDto: CreateProfileDto) {
    // Verificar si el usuario ya tiene un perfil
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has a profile');
    }

    // Verificar si el username ya existe
    const usernameExists = await this.prisma.profile.findUnique({
      where: { username: createProfileDto.username },
    });

    if (usernameExists) {
      throw new ConflictException('Username already taken');
    }

    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        userId,
      },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.profile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          },
        },
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          },
        },
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async findByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            plan: true,
            features: true,
          },
        },
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Increment view count
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: { viewCount: { increment: 1 } },
    });

    return profile;
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        links: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(id: string, userId: string, updateProfileDto: UpdateProfileDto) {
    // Verificar que el perfil pertenezca al usuario
    const profile = await this.prisma.profile.findFirst({
      where: { id, userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found or unauthorized');
    }

    // Si se actualiza el username, verificar que no exista
    if (updateProfileDto.username && updateProfileDto.username !== profile.username) {
      const usernameExists = await this.prisma.profile.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (usernameExists) {
        throw new ConflictException('Username already taken');
      }
    }

    return this.prisma.profile.update({
      where: { id },
      data: updateProfileDto,
      include: {
        links: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verificar que el perfil pertenezca al usuario
    const profile = await this.prisma.profile.findFirst({
      where: { id, userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found or unauthorized');
    }

    // Soft delete
    return this.prisma.profile.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

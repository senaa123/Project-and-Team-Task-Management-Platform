import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { IProjectRepository } from '../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../domain/entities/project.entity';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaService) {}

  private toEntity(p: any) {
    return new ProjectEntity(
      p.id,
      p.name,
      p.description,
      p.ownerId,
      p.createdAt,
      p.owner ? { id: p.owner.id, name: p.owner.name, email: p.owner.email, empId: p.owner.empId } : undefined,
      p.members ? p.members.map((m: any) => ({
        user: { id: m.user.id, name: m.user.name, email: m.user.email, empId: m.user.empId }
      })) : undefined
    );
  }

  async create(data: { name: string; description?: string; ownerId: string }) {
    const p = await this.prisma.project.create({ data });
    return this.toEntity(p);
  }

  async findById(id: string) {
    const p = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, empId: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, empId: true } },
          },
        },
      },
    });
    return p ? this.toEntity(p) : null;
  }

  async findAllForUser(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        owner: { select: { id: true, name: true, email: true, empId: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, empId: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => this.toEntity(p));
  }
  async findAll() {
    const projects = await this.prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, empId: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, empId: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => this.toEntity(p));
  }

  async updateOwner(projectId: string, ownerId: string) {
    const p = await this.prisma.project.update({
      where: { id: projectId },
      data: { ownerId },
      include: {
        owner: { select: { id: true, name: true, email: true, empId: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, empId: true } },
          },
        },
      },
    });
    return this.toEntity(p);
  }

  async addMember(projectId: string, userId: string) {
    await this.prisma.projectMember.create({ data: { projectId, userId } });
  }

  async isMember(projectId: string, userId: string) {
    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return !!existing;
  }

  async getMembers(projectId: string) {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });
    return members.map(m => m.user).filter(u => u.isVerified);
  }
}
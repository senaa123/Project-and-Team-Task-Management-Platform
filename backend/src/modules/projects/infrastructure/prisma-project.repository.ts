import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { IProjectRepository } from '../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../domain/entities/project.entity';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaService) {}

  private toEntity(p: any) {
    return new ProjectEntity(p.id, p.name, p.description, p.ownerId, p.createdAt);
  }

  async create(data: { name: string; description?: string; ownerId: string }) {
    const p = await this.prisma.project.create({ data });
    return this.toEntity(p);
  }

  async findById(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id } });
    return p ? this.toEntity(p) : null;
  }

  async findAllForUser(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    });
    return projects.map((p) => this.toEntity(p));
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
}
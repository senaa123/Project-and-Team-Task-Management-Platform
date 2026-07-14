import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ITaskRepository } from '../domain/repositories/task.repository.interface';
import { TaskEntity } from '../domain/entities/task.entity';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaService) {}

  private toEntity(t: any) {
    return new TaskEntity(t.id, t.projectId, t.title, t.description, t.status, t.priority, t.assigneeId, t.dueDate);
  }

  async create(data: any) {
    const t = await this.prisma.task.create({ data });
    return this.toEntity(t);
  }

  async findById(id: string) {
    const t = await this.prisma.task.findUnique({ where: { id } });
    return t ? this.toEntity(t) : null;
  }

  async findByProject(projectId: string) {
    const tasks = await this.prisma.task.findMany({ where: { projectId } });
    return tasks.map((t) => this.toEntity(t));
  }

  async updateStatus(id: string, status: string) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { status: status as TaskStatus },
    });
    return this.toEntity(t);
  }

  async updateAssignee(id: string, assigneeId: string) {
    const t = await this.prisma.task.update({ where: { id }, data: { assigneeId } });
    return this.toEntity(t);
  }
}
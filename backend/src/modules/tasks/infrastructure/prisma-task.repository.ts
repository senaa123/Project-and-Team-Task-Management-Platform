import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ITaskRepository } from '../domain/repositories/task.repository.interface';
import { TaskEntity } from '../domain/entities/task.entity';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaService) {}

  private toEntity(t: any) {
    return new TaskEntity(
      t.id, t.projectId, t.title, t.description, t.status, t.priority, t.assigneeId, t.dueDate,
      t.assignee ? { id: t.assignee.id, name: t.assignee.name, empId: t.assignee.empId } : undefined
    );
  }

  async create(data: any) {
    const t = await this.prisma.task.create({ data, include: { assignee: true } });
    return this.toEntity(t);
  }

  async findById(id: string) {
    const t = await this.prisma.task.findUnique({ where: { id }, include: { assignee: true } });
    return t ? this.toEntity(t) : null;
  }

  async findByProject(projectId: string) {
    const tasks = await this.prisma.task.findMany({ where: { projectId }, include: { assignee: true } });
    return tasks.map((t) => this.toEntity(t));
  }

  async findByAssignee(assigneeId: string) {
    const tasks = await this.prisma.task.findMany({ where: { assigneeId }, include: { assignee: true } });
    return tasks.map((t) => this.toEntity(t));
  }

  async updateStatus(id: string, status: string) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { status: status as TaskStatus },
      include: { assignee: true }
    });
    return this.toEntity(t);
  }

  async updateAssignee(id: string, assigneeId: string) {
    const t = await this.prisma.task.update({ where: { id }, data: { assigneeId }, include: { assignee: true } });
    return this.toEntity(t);
  }

  async update(id: string, data: any) {
    const t = await this.prisma.task.update({
      where: { id },
      data,
      include: { assignee: true },
    });
    return this.toEntity(t);
  }
}
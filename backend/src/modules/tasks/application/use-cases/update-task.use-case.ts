import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { type ITaskRepository, TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepo: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(taskId: string, dto: UpdateTaskDto, requesterId: string, requesterRole: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    if (requesterRole === 'PROJECT_MANAGER') {
      const project = await this.prisma.project.findUnique({ where: { id: task.projectId } });
      if (project?.ownerId !== requesterId) {
        throw new ForbiddenException('You can only edit tasks in projects you manage');
      }
    }

    if (dto.assigneeId) {
      const isMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: dto.assigneeId },
        },
      });

      if (!isMember) {
        throw new BadRequestException('The assigned user is not a member of this project.');
      }
    }

    const updateData = {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    };

    return this.taskRepo.update(taskId, updateData);
  }
}

import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  type ITaskRepository,
  TASK_REPOSITORY,
} from '../../domain/repositories/task.repository.interface';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepo: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    taskId: string,
    status: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    if (requesterRole === 'TEAM_MEMBER' && task.assigneeId !== requesterId) {
      throw new ForbiddenException('You can only update tasks assigned to you');
    }

    if (requesterRole === 'PROJECT_MANAGER') {
      const project = await this.prisma.project.findUnique({
        where: { id: task.projectId },
      });
      if (project?.ownerId !== requesterId) {
        throw new ForbiddenException(
          'You can only update tasks in projects you manage',
        );
      }
    }

    return this.taskRepo.updateStatus(taskId, status);
  }
}

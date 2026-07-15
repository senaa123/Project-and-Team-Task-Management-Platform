import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  type ITaskRepository,
  TASK_REPOSITORY,
} from '../../domain/repositories/task.repository.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepo: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    dto: CreateTaskDto,
    requesterId: string,
    requesterRole: string,
  ) {
    if (requesterRole === 'PROJECT_MANAGER') {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (project?.ownerId !== requesterId) {
        throw new ForbiddenException(
          'You can only create tasks in projects you manage',
        );
      }
    }

    if (dto.assigneeId) {
      const isMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: dto.projectId,
            userId: dto.assigneeId,
          },
        },
      });

      if (!isMember) {
        throw new BadRequestException(
          'The assigned user is not a member of this project.',
        );
      }
    }

    return this.taskRepo.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }
}

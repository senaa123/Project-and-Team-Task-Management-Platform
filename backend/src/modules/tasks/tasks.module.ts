import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TasksController } from './presentation/tasks.controller';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { UpdateTaskStatusUseCase } from './application/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { GetProjectTasksUseCase } from './application/use-cases/get-project-tasks.use-case';
import { GetMyTasksUseCase } from './application/use-cases/get-my-tasks.use-case';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';
import { TASK_REPOSITORY } from './domain/repositories/task.repository.interface';
import { PrismaService } from '../../shared/database/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    UpdateTaskStatusUseCase,
    UpdateTaskUseCase,
    GetProjectTasksUseCase,
    GetMyTasksUseCase,
    PrismaService,
    { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
  ],
})
export class TasksModule {}
import { Inject, Injectable } from '@nestjs/common';
import { type ITaskRepository, TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';

@Injectable()
export class GetProjectTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(projectId: string) {
    return this.taskRepo.findByProject(projectId);
  }
}
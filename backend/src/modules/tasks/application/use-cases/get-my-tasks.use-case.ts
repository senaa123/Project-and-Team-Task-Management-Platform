import { Inject, Injectable } from '@nestjs/common';
import { type ITaskRepository, TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';

@Injectable()
export class GetMyTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(userId: string) {
    return this.taskRepo.findByAssignee(userId);
  }
}

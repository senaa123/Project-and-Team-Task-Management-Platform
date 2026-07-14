import { Inject, Injectable } from '@nestjs/common';
import { type ITaskRepository, TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(dto: CreateTaskDto) {
    return this.taskRepo.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }
}
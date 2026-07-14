import { TaskEntity } from '../entities/task.entity';

export interface ITaskRepository {
  create(data: {
    projectId: string;
    title: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: Date;
  }): Promise<TaskEntity>;
  findById(id: string): Promise<TaskEntity | null>;
  findByProject(projectId: string): Promise<TaskEntity[]>;
  updateStatus(id: string, status: string): Promise<TaskEntity>;
  updateAssignee(id: string, assigneeId: string): Promise<TaskEntity>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';
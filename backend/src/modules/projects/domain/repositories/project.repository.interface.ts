import { ProjectEntity } from '../entities/project.entity';

export interface IProjectRepository {
  create(data: {
    name: string;
    description?: string;
    ownerId: string;
  }): Promise<ProjectEntity>;
  findById(id: string): Promise<ProjectEntity | null>;
  findAllForUser(userId: string): Promise<ProjectEntity[]>;
  addMember(projectId: string, userId: string): Promise<void>;
  isMember(projectId: string, userId: string): Promise<boolean>;
  getMembers(projectId: string): Promise<any[]>;
  findAll(): Promise<ProjectEntity[]>;
  updateOwner(projectId: string, ownerId: string): Promise<ProjectEntity>;
}

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

@Injectable()
export class UpdateProjectOwnerUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(projectId: string, ownerId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    return this.projectRepo.updateOwner(projectId, ownerId);
  }
}

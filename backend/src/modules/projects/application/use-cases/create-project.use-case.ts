import { Inject, Injectable } from '@nestjs/common';
import {
  type IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(dto: CreateProjectDto, ownerId: string) {
    const project = await this.projectRepo.create({
      name: dto.name,
      description: dto.description,
      ownerId,
    });
    if (dto.memberIds && dto.memberIds.length > 0) {
      for (const memberId of dto.memberIds) {
        await this.projectRepo.addMember(project.id, memberId);
      }
    }
    return project;
  }
}

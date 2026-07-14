import { Inject, Injectable } from '@nestjs/common';
import { type IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(dto: CreateProjectDto, ownerId: string) {
    return this.projectRepo.create({ ...dto, ownerId });
  }
}
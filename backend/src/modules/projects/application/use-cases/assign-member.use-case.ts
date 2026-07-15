import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  type IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

@Injectable()
export class AssignMemberUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(projectId: string, userId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const alreadyMember = await this.projectRepo.isMember(projectId, userId);
    if (alreadyMember)
      throw new ConflictException('User is already a member of this project');

    await this.projectRepo.addMember(projectId, userId);
    return { message: 'Member assigned successfully' };
  }
}

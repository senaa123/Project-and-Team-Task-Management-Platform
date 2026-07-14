import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsController } from './presentation/projects.controller';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { AssignMemberUseCase } from './application/use-cases/assign-member.use-case';
import { GetUserProjectsUseCase } from './application/use-cases/get-user-projects.use-case';
import { PrismaProjectRepository } from './infrastructure/prisma-project.repository';
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository.interface';
import { PrismaService } from '../../shared/database/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController],
  providers: [
    CreateProjectUseCase,
    AssignMemberUseCase,
    GetUserProjectsUseCase,
    PrismaService,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
  ],
})
export class ProjectsModule {}
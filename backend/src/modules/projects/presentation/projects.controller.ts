import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { AssignMemberUseCase } from '../application/use-cases/assign-member.use-case';
import { GetUserProjectsUseCase } from '../application/use-cases/get-user-projects.use-case';
import { CreateProjectDto } from '../application/dto/create-project.dto';
import { AssignMemberDto } from '../application/dto/assign-member.dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly assignMemberUseCase: AssignMemberUseCase,
    private readonly getUserProjectsUseCase: GetUserProjectsUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.createProjectUseCase.execute(dto, req.user.userId);
  }

  @Post(':id/members')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  assignMember(@Param('id') projectId: string, @Body() dto: AssignMemberDto) {
    return this.assignMemberUseCase.execute(projectId, dto.userId);
  }

  @Get()
  getMyProjects(@Req() req: any) {
    return this.getUserProjectsUseCase.execute(req.user.userId);
  }
}
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { AssignMemberUseCase } from '../application/use-cases/assign-member.use-case';
import { GetUserProjectsUseCase } from '../application/use-cases/get-user-projects.use-case';
import { GetProjectMembersUseCase } from '../application/use-cases/get-project-members.use-case';
import { GetAllProjectsUseCase } from '../application/use-cases/get-all-projects.use-case';
import { UpdateProjectOwnerUseCase } from '../application/use-cases/update-project-owner.use-case';
import { CreateProjectDto } from '../application/dto/create-project.dto';
import { AssignMemberDto } from '../application/dto/assign-member.dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly assignMemberUseCase: AssignMemberUseCase,
    private readonly getUserProjectsUseCase: GetUserProjectsUseCase,
    private readonly getProjectMembersUseCase: GetProjectMembersUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly updateProjectOwnerUseCase: UpdateProjectOwnerUseCase,
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

  @Get(':id/members')
  getMembers(@Param('id') projectId: string) {
    return this.getProjectMembersUseCase.execute(projectId);
  }

  @Get()
  getMyProjects(@Req() req: any) {
    return this.getUserProjectsUseCase.execute(req.user.userId);
  }

  @Get('all')
  getAllProjects() {
    return this.getAllProjectsUseCase.execute();
  }

  @Patch(':id/owner')
  @Roles('ADMIN')
  updateOwner(
    @Param('id') projectId: string,
    @Body('ownerId') ownerId: string,
  ) {
    return this.updateProjectOwnerUseCase.execute(projectId, ownerId);
  }
}

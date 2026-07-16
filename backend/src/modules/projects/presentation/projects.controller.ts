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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
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
import { UpdateProjectOwnerDto } from '../application/dto/update-project-owner.dto';

@ApiTags('Projects')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Creates a project owned by the requesting user. Admin or Project Manager only.',
  })
  @ApiResponse({ status: 201, description: 'Project created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role.' })
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.createProjectUseCase.execute(dto, req.user.userId);
  }

  @Post(':id/members')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({
    summary: 'Add a member to a project',
    description: 'Assigns a verified user as a member of the specified project.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Member assigned successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict — user is already a member.' })
  @ApiResponse({ status: 404, description: 'Project or user not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role.' })
  assignMember(@Param('id') projectId: string, @Body() dto: AssignMemberDto) {
    return this.assignMemberUseCase.execute(projectId, dto.userId);
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'Get members of a project',
    description: 'Returns all verified members belonging to the specified project.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of project members returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  getMembers(@Param('id') projectId: string) {
    return this.getProjectMembersUseCase.execute(projectId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get projects for the current user',
    description: 'Returns projects the authenticated user owns or is a member of.',
  })
  @ApiResponse({ status: 200, description: 'List of user projects returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  getMyProjects(@Req() req: any) {
    return this.getUserProjectsUseCase.execute(req.user.userId);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all projects in the system',
    description: 'Returns every project regardless of membership. Used for admin overviews and task project selectors.',
  })
  @ApiResponse({ status: 200, description: 'Full list of projects returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  getAllProjects() {
    return this.getAllProjectsUseCase.execute();
  }

  @Patch(':id/owner')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Change the Project Manager of a project',
    description: 'Updates the owner (Project Manager) of a project. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project owner updated successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required.' })
  updateOwner(
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectOwnerDto,
  ) {
    return this.updateProjectOwnerUseCase.execute(projectId, dto.ownerId);
  }
}

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
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { UpdateTaskStatusUseCase } from '../application/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { GetProjectTasksUseCase } from '../application/use-cases/get-project-tasks.use-case';
import { GetMyTasksUseCase } from '../application/use-cases/get-my-tasks.use-case';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskStatusDto } from '../application/dto/update-task-status.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly getProjectTasksUseCase: GetProjectTasksUseCase,
    private readonly getMyTasksUseCase: GetMyTasksUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({
    summary: 'Create a new task',
    description:
      'Creates a task inside a project. The assignee must be a verified member of the project. Admin or Project Manager only.',
  })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad request — assignee is not a member of the project.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role.' })
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.createTaskUseCase.execute(dto, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update the status of a task',
    description:
      'Updates the Kanban status of a task. Team Members can only update tasks assigned to them. Project Managers can only update tasks in projects they own.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the task to update',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — you do not have permission to update this task.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @Req() req: any,
  ) {
    return this.updateTaskStatusUseCase.execute(
      id,
      dto.status,
      req.user.userId,
      req.user.role,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({
    summary: 'Update task details',
    description:
      'Updates the title, description, priority, assignee, or due date of a task. Project Managers can only edit tasks in projects they own.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the task to edit',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad request — new assignee is not a member of the project.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — you do not manage this project.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.updateTaskUseCase.execute(
      id,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get all tasks in a project',
    description:
      'Returns every task belonging to the specified project (Kanban board data).',
  })
  @ApiParam({
    name: 'projectId',
    description: 'UUID of the project',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'List of project tasks returned.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  getByProject(@Param('projectId') projectId: string) {
    return this.getProjectTasksUseCase.execute(projectId);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get tasks assigned to the current user',
    description:
      'Returns all tasks assigned to the authenticated user across all projects.',
  })
  @ApiResponse({ status: 200, description: 'List of assigned tasks returned.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  getMyTasks(@Req() req: any) {
    return this.getMyTasksUseCase.execute(req.user.userId);
  }
}

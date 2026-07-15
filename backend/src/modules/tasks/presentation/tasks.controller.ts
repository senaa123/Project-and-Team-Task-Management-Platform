import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
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
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.createTaskUseCase.execute(dto, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto, @Req() req: any) {
    return this.updateTaskStatusUseCase.execute(id, dto.status, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    return this.updateTaskUseCase.execute(id, dto, req.user.userId, req.user.role);
  }

  @Get('project/:projectId')
  getByProject(@Param('projectId') projectId: string) {
    return this.getProjectTasksUseCase.execute(projectId);
  }

  @Get('my')
  getMyTasks(@Req() req: any) {
    return this.getMyTasksUseCase.execute(req.user.userId);
  }
}
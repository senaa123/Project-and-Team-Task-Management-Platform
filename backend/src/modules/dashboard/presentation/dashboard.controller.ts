import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { GetAdminDashboardUseCase } from '../application/use-cases/get-admin-dashboard.use-case';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
  ) {}

  @Get('admin')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({
    summary: 'Get admin/PM dashboard data',
    description:
      'Returns aggregated project completion percentages and top-performing team members (by tasks completed). Admin and Project Manager only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data returned successfully.',
    schema: {
      example: {
        projectProgress: [
          {
            id: 'uuid',
            name: 'E-commerce Redesign',
            totalTasks: 10,
            doneTasks: 7,
            completionPercentage: 70,
          },
        ],
        topPerformers: [
          {
            id: 'uuid',
            name: 'Jane Doe',
            email: 'jane@company.com',
            empId: 'EMP-0042',
            doneCount: 5,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Admin or Project Manager role required.',
  })
  getAdminDashboard() {
    return this.getAdminDashboardUseCase.execute();
  }
}

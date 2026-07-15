import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { GetAdminDashboardUseCase } from '../application/use-cases/get-admin-dashboard.use-case';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase) {}

  @Get('admin')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  getAdminDashboard() {
    return this.getAdminDashboardUseCase.execute();
  }
}

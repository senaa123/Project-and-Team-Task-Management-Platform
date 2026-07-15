import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardController } from './presentation/dashboard.controller';
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard.use-case';
import { PrismaService } from '../../shared/database/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [GetAdminDashboardUseCase, PrismaService],
})
export class DashboardModule {}

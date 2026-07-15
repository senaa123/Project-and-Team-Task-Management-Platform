import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../domain/repositories/user.repository.interface';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  @Get('pending')
  @Roles('ADMIN')
  async getPending() {
    return this.userRepo.findPending();
  }

  @Get('verified')
  async getVerified() {
    return this.userRepo.findVerified();
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  async verifyUser(@Param('id') id: string, @Body('role') role: string) {
    if (!['PROJECT_MANAGER', 'TEAM_MEMBER'].includes(role)) {
      throw new Error('Invalid role specified');
    }
    return this.userRepo.verifyUser(id, role);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async rejectUser(@Param('id') id: string) {
    await this.userRepo.deleteUser(id);
    return { success: true };
  }
}

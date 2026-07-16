import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
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
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../domain/repositories/user.repository.interface';
import { VerifyUserDto } from '../application/dto/verify-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  @Get('pending')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get all pending user registrations',
    description:
      'Returns a list of users who have registered but are not yet verified. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending users returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required.' })
  async getPending() {
    return this.userRepo.findPending();
  }

  @Get('verified')
  @ApiOperation({
    summary: 'Get all verified users',
    description:
      'Returns all users who have been approved and are active in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of verified users returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  async getVerified() {
    return this.userRepo.findVerified();
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Approve a pending user and assign their role',
    description:
      'Verifies a pending user registration and assigns them a role. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the pending user to approve',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully verified and role assigned.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request — invalid role value.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async verifyUser(@Param('id') id: string, @Body() dto: VerifyUserDto) {
    return this.userRepo.verifyUser(id, dto.role);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject and delete a pending user',
    description:
      'Permanently removes a pending user registration from the system. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the pending user to reject',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully rejected and removed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async rejectUser(@Param('id') id: string) {
    await this.userRepo.deleteUser(id);
    return { success: true };
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with a PENDING status. The account must be approved by an Admin before the user can log in.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful. Account is pending admin approval.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict — email is already registered.',
  })
  @ApiResponse({ status: 400, description: 'Bad request — validation failed.' })
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in and receive a JWT token',
    description:
      'Authenticates a verified user and returns a JWT access token. Unverified (pending) accounts will be rejected.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns accessToken and user details.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — invalid credentials or unverified account.',
  })
  @ApiResponse({ status: 400, description: 'Bad request — validation failed.' })
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}

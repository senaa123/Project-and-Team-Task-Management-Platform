import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: RegisterDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.userRepo.create({
      empId: dto.empId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: 'PENDING',
      isVerified: false,
    });

    return {
      message:
        'Registration successful. Please wait for an administrator to verify your account and assign your role.',
    };
  }
}

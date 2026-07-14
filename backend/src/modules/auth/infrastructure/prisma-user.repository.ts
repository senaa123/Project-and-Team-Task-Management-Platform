import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { UserEntity } from '../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string; passwordHash: string; role: string }) {
    const u = await this.prisma.user.create({ data: data as any });
    return new UserEntity(u.id, u.name, u.email, u.passwordHash, u.role);
  }

  async findByEmail(email: string) {
    const u = await this.prisma.user.findUnique({ where: { email } });
    return u ? new UserEntity(u.id, u.name, u.email, u.passwordHash, u.role) : null;
  }
}
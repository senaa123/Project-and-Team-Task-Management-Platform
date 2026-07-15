import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { UserEntity } from '../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    empId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    isVerified: boolean;
  }) {
    const u = await this.prisma.user.create({ data: data as any });
    return new UserEntity(
      u.id,
      u.empId,
      u.name,
      u.email,
      u.passwordHash,
      u.role,
      u.isVerified,
    );
  }

  async findByEmail(email: string) {
    const u = await this.prisma.user.findUnique({ where: { email } });
    return u
      ? new UserEntity(
          u.id,
          u.empId,
          u.name,
          u.email,
          u.passwordHash,
          u.role,
          u.isVerified,
        )
      : null;
  }

  async findPending() {
    const users = await this.prisma.user.findMany({
      where: { isVerified: false },
    });
    return users.map(
      (u) =>
        new UserEntity(
          u.id,
          u.empId,
          u.name,
          u.email,
          u.passwordHash,
          u.role,
          u.isVerified,
        ),
    );
  }

  async findVerified() {
    const users = await this.prisma.user.findMany({
      where: { isVerified: true },
    });
    return users.map(
      (u) =>
        new UserEntity(
          u.id,
          u.empId,
          u.name,
          u.email,
          u.passwordHash,
          u.role,
          u.isVerified,
        ),
    );
  }

  async verifyUser(userId: string, role: string) {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true, role: role as any },
    });
    return new UserEntity(
      u.id,
      u.empId,
      u.name,
      u.email,
      u.passwordHash,
      u.role,
      u.isVerified,
    );
  }
}

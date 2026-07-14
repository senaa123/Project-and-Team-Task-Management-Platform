import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  create(data: { name: string; email: string; passwordHash: string; role: string }): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
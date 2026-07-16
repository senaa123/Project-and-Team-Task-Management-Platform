import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  create(data: {
    empId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    isVerified: boolean;
  }): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findPending(): Promise<UserEntity[]>;
  findVerified(): Promise<UserEntity[]>;
  verifyUser(userId: string, role: string): Promise<UserEntity>;
  deleteUser(userId: string): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';

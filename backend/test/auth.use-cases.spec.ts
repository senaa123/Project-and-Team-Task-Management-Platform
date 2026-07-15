import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from '../src/modules/auth/application/use-cases/register.use-case';
import { LoginUseCase } from '../src/modules/auth/application/use-cases/login.use-case';
import { USER_REPOSITORY } from '../src/modules/auth/domain/repositories/user.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock user data
const mockUser = {
  id: 'user-uuid-1',
  empId: 'EMP001',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: '',
  role: 'TEAM_MEMBER',
  isVerified: true,
};

describe('Auth Use Cases', () => {
  let registerUseCase: RegisterUseCase;
  let loginUseCase: LoginUseCase;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findPending: jest.fn(),
    verifyUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  // ─── REGISTER ───────────────────────────────────────────────────────────────
  describe('RegisterUseCase', () => {
    it('✅ should register a new user successfully', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({ ...mockUser, isVerified: false, role: 'PENDING' });

      const result = await registerUseCase.execute({
        empId: 'EMP001',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'PENDING', isVerified: false }),
      );
      expect(result).toHaveProperty('message');
    });

    it('❌ should throw ConflictException if email already registered', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        registerUseCase.execute({
          empId: 'EMP002',
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  describe('LoginUseCase', () => {
    it('✅ should login a verified user and return a JWT', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, passwordHash: hash });

      const result = await loginUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user).toMatchObject({ email: 'test@example.com', role: 'TEAM_MEMBER' });
    });

    it('❌ should throw UnauthorizedException if user does not exist', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        loginUseCase.execute({ email: 'ghost@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('❌ should block login if user is not verified (pending)', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, isVerified: false });

      await expect(
        loginUseCase.execute({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('❌ should throw UnauthorizedException if password is wrong', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, passwordHash: hash });

      await expect(
        loginUseCase.execute({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

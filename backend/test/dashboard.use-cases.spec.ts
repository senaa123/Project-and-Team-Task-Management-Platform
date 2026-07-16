import { Test, TestingModule } from '@nestjs/testing';
import { GetAdminDashboardUseCase } from '../src/modules/dashboard/application/use-cases/get-admin-dashboard.use-case';
import { PrismaService } from '../src/shared/database/prisma.service';

describe('Dashboard Use Cases', () => {
  let getAdminDashboardUseCase: GetAdminDashboardUseCase;

  const mockPrisma = {
    project: {
      findMany: jest.fn(),
    },
    task: {
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdminDashboardUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    getAdminDashboardUseCase = module.get<GetAdminDashboardUseCase>(
      GetAdminDashboardUseCase,
    );
    jest.clearAllMocks();
  });

  // ─── GetAdminDashboardUseCase ────────────────────────────────────────────────
  describe('GetAdminDashboardUseCase', () => {
    it('✅ should calculate project completion percentages correctly', async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: 'proj-uuid-1',
          name: 'Alpha Project',
          tasks: [
            { status: 'DONE' },
            { status: 'DONE' },
            { status: 'TODO' },
            { status: 'IN_PROGRESS' },
          ],
        },
      ]);
      mockPrisma.task.groupBy.mockResolvedValue([]);

      const result = await getAdminDashboardUseCase.execute();

      expect(result.projectProgress).toHaveLength(1);
      const alpha = result.projectProgress[0];
      expect(alpha.totalTasks).toBe(4);
      expect(alpha.doneTasks).toBe(2);
      expect(alpha.completionPercentage).toBe(50);
    });

    it('✅ should return 0% completion for a project with no tasks', async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        { id: 'proj-uuid-2', name: 'Empty Project', tasks: [] },
      ]);
      mockPrisma.task.groupBy.mockResolvedValue([]);

      const result = await getAdminDashboardUseCase.execute();

      const empty = result.projectProgress[0];
      expect(empty.totalTasks).toBe(0);
      expect(empty.doneTasks).toBe(0);
      expect(empty.completionPercentage).toBe(0);
    });

    it('✅ should return top performers sorted by done task count', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.task.groupBy.mockResolvedValue([
        { assigneeId: 'user-uuid-1', _count: { id: 5 } },
        { assigneeId: 'user-uuid-2', _count: { id: 3 } },
      ]);
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-uuid-1',
          name: 'Alice',
          email: 'alice@co.com',
          empId: 'EMP-001',
        })
        .mockResolvedValueOnce({
          id: 'user-uuid-2',
          name: 'Bob',
          email: 'bob@co.com',
          empId: 'EMP-002',
        });

      const result = await getAdminDashboardUseCase.execute();

      expect(result.topPerformers).toHaveLength(2);
      expect(result.topPerformers[0].name).toBe('Alice');
      expect(result.topPerformers[0].doneCount).toBe(5);
      expect(result.topPerformers[1].name).toBe('Bob');
      expect(result.topPerformers[1].doneCount).toBe(3);
    });

    it('✅ should return empty top performers when no tasks are done', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.task.groupBy.mockResolvedValue([]);

      const result = await getAdminDashboardUseCase.execute();

      expect(result.topPerformers).toHaveLength(0);
    });
  });
});

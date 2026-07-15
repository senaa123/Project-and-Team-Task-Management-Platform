import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskUseCase } from '../src/modules/tasks/application/use-cases/create-task.use-case';
import { UpdateTaskStatusUseCase } from '../src/modules/tasks/application/use-cases/update-task-status.use-case';
import { GetMyTasksUseCase } from '../src/modules/tasks/application/use-cases/get-my-tasks.use-case';
import { TASK_REPOSITORY } from '../src/modules/tasks/domain/repositories/task.repository.interface';
import { PrismaService } from '../src/shared/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockTask = {
  id: 'task-uuid-1',
  projectId: 'proj-uuid-1',
  title: 'Fix the bug',
  description: null,
  status: 'TODO',
  priority: 'HIGH',
  assigneeId: 'user-uuid-2',
  dueDate: null,
};

describe('Tasks Use Cases', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let updateTaskStatusUseCase: UpdateTaskStatusUseCase;
  let getMyTasksUseCase: GetMyTasksUseCase;

  const mockTaskRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByProject: jest.fn(),
    findByAssignee: jest.fn(),
    updateStatus: jest.fn(),
  };

  // Mock PrismaService for assignee membership check
  const mockPrisma = {
    projectMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        UpdateTaskStatusUseCase,
        GetMyTasksUseCase,
        { provide: TASK_REPOSITORY, useValue: mockTaskRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    createTaskUseCase = module.get<CreateTaskUseCase>(CreateTaskUseCase);
    updateTaskStatusUseCase = module.get<UpdateTaskStatusUseCase>(
      UpdateTaskStatusUseCase,
    );
    getMyTasksUseCase = module.get<GetMyTasksUseCase>(GetMyTasksUseCase);
    jest.clearAllMocks();
  });

  describe('CreateTaskUseCase', () => {
    it('✅ should create a task without an assignee', async () => {
      mockTaskRepo.create.mockResolvedValue({ ...mockTask, assigneeId: null });

      const result = await createTaskUseCase.execute(
        {
          projectId: 'proj-uuid-1',
          title: 'Fix the bug',
          priority: 'HIGH',
        },
        'admin-id',
        'ADMIN',
      );

      expect(mockPrisma.projectMember.findUnique).not.toHaveBeenCalled();
      expect(mockTaskRepo.create).toHaveBeenCalled();
      expect(result.title).toBe('Fix the bug');
    });

    it('✅ should create a task when assignee IS a project member', async () => {
      mockPrisma.projectMember.findUnique.mockResolvedValue({
        projectId: 'proj-uuid-1',
        userId: 'user-uuid-2',
      });
      mockTaskRepo.create.mockResolvedValue(mockTask);

      const result = await createTaskUseCase.execute(
        {
          projectId: 'proj-uuid-1',
          title: 'Fix the bug',
          assigneeId: 'user-uuid-2',
        },
        'admin-id',
        'ADMIN',
      );

      expect(mockPrisma.projectMember.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            projectId_userId: {
              projectId: 'proj-uuid-1',
              userId: 'user-uuid-2',
            },
          },
        }),
      );
      expect(result.assigneeId).toBe('user-uuid-2');
    });

    it('❌ should throw BadRequestException when assignee is NOT a project member', async () => {
      mockPrisma.projectMember.findUnique.mockResolvedValue(null); // Not a member

      await expect(
        createTaskUseCase.execute(
          {
            projectId: 'proj-uuid-1',
            title: 'Sneaky task',
            assigneeId: 'outside-user-uuid',
          },
          'admin-id',
          'ADMIN',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockTaskRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('UpdateTaskStatusUseCase', () => {
    it('✅ should update task status as assignee', async () => {
      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' };
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockTaskRepo.updateStatus.mockResolvedValue(updatedTask);

      const result = await updateTaskStatusUseCase.execute(
        'task-uuid-1',
        'IN_PROGRESS',
        'user-uuid-2',
        'TEAM_MEMBER',
      );

      expect(mockTaskRepo.updateStatus).toHaveBeenCalledWith(
        'task-uuid-1',
        'IN_PROGRESS',
      );
      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  describe('GetMyTasksUseCase', () => {
    it('✅ should return tasks assigned to a user', async () => {
      mockTaskRepo.findByAssignee.mockResolvedValue([mockTask]);

      const result = await getMyTasksUseCase.execute('user-uuid-2');

      expect(mockTaskRepo.findByAssignee).toHaveBeenCalledWith('user-uuid-2');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Fix the bug');
    });

    it('✅ should return empty array if no tasks assigned', async () => {
      mockTaskRepo.findByAssignee.mockResolvedValue([]);

      const result = await getMyTasksUseCase.execute('user-uuid-99');
      expect(result).toHaveLength(0);
    });
  });
});

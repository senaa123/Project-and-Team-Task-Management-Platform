import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskUseCase } from '../src/modules/tasks/application/use-cases/create-task.use-case';
import { UpdateTaskStatusUseCase } from '../src/modules/tasks/application/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase } from '../src/modules/tasks/application/use-cases/update-task.use-case';
import { GetMyTasksUseCase } from '../src/modules/tasks/application/use-cases/get-my-tasks.use-case';
import { GetProjectTasksUseCase } from '../src/modules/tasks/application/use-cases/get-project-tasks.use-case';
import { TASK_REPOSITORY } from '../src/modules/tasks/domain/repositories/task.repository.interface';
import { PrismaService } from '../src/shared/database/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

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
  let updateTaskUseCase: UpdateTaskUseCase;
  let getMyTasksUseCase: GetMyTasksUseCase;
  let getProjectTasksUseCase: GetProjectTasksUseCase;

  const mockTaskRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByProject: jest.fn(),
    findByAssignee: jest.fn(),
    updateStatus: jest.fn(),
    update: jest.fn(),
  };

  // Mock PrismaService for assignee membership check and PM project ownership
  const mockPrisma = {
    projectMember: {
      findUnique: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        UpdateTaskStatusUseCase,
        UpdateTaskUseCase,
        GetMyTasksUseCase,
        GetProjectTasksUseCase,
        { provide: TASK_REPOSITORY, useValue: mockTaskRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    createTaskUseCase = module.get<CreateTaskUseCase>(CreateTaskUseCase);
    updateTaskStatusUseCase = module.get<UpdateTaskStatusUseCase>(
      UpdateTaskStatusUseCase,
    );
    updateTaskUseCase = module.get<UpdateTaskUseCase>(UpdateTaskUseCase);
    getMyTasksUseCase = module.get<GetMyTasksUseCase>(GetMyTasksUseCase);
    getProjectTasksUseCase =
      module.get<GetProjectTasksUseCase>(GetProjectTasksUseCase);
    jest.clearAllMocks();
  });

  // ─── CreateTaskUseCase ───────────────────────────────────────────────────────
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
      mockPrisma.projectMember.findUnique.mockResolvedValue(null);

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

  // ─── UpdateTaskStatusUseCase ─────────────────────────────────────────────────
  describe('UpdateTaskStatusUseCase', () => {
    it('✅ should update task status as the assigned TEAM_MEMBER', async () => {
      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' };
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockTaskRepo.updateStatus.mockResolvedValue(updatedTask);

      const result = await updateTaskStatusUseCase.execute(
        'task-uuid-1',
        'IN_PROGRESS',
        'user-uuid-2', // same as task.assigneeId
        'TEAM_MEMBER',
      );

      expect(mockTaskRepo.updateStatus).toHaveBeenCalledWith(
        'task-uuid-1',
        'IN_PROGRESS',
      );
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('❌ should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);

      await expect(
        updateTaskStatusUseCase.execute(
          'nonexistent-task',
          'DONE',
          'user-uuid-2',
          'TEAM_MEMBER',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException when TEAM_MEMBER tries to update someone else\'s task', async () => {
      mockTaskRepo.findById.mockResolvedValue(mockTask); // assigneeId = 'user-uuid-2'

      await expect(
        updateTaskStatusUseCase.execute(
          'task-uuid-1',
          'DONE',
          'user-uuid-99', // different user
          'TEAM_MEMBER',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockTaskRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('❌ should throw ForbiddenException when PROJECT_MANAGER updates task in a project they don\'t own', async () => {
      mockTaskRepo.findById.mockResolvedValue(mockTask); // projectId = 'proj-uuid-1'
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-uuid-1',
        ownerId: 'pm-uuid-1', // different PM owns the project
      });

      await expect(
        updateTaskStatusUseCase.execute(
          'task-uuid-1',
          'DONE',
          'pm-uuid-99', // different PM
          'PROJECT_MANAGER',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockTaskRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('✅ should allow PROJECT_MANAGER to update status in their own project', async () => {
      const updatedTask = { ...mockTask, status: 'DONE' };
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-uuid-1',
        ownerId: 'pm-uuid-1',
      });
      mockTaskRepo.updateStatus.mockResolvedValue(updatedTask);

      const result = await updateTaskStatusUseCase.execute(
        'task-uuid-1',
        'DONE',
        'pm-uuid-1', // same PM who owns the project
        'PROJECT_MANAGER',
      );

      expect(result.status).toBe('DONE');
    });
  });

  // ─── UpdateTaskUseCase ───────────────────────────────────────────────────────
  describe('UpdateTaskUseCase', () => {
    it('✅ should update a task as ADMIN', async () => {
      const updatedTask = { ...mockTask, title: 'Updated title' };
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockTaskRepo.update.mockResolvedValue(updatedTask);

      const result = await updateTaskUseCase.execute(
        'task-uuid-1',
        { title: 'Updated title' },
        'admin-uuid',
        'ADMIN',
      );

      expect(mockTaskRepo.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated title');
    });

    it('❌ should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);

      await expect(
        updateTaskUseCase.execute(
          'nonexistent-task',
          { title: 'New title' },
          'admin-uuid',
          'ADMIN',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException when PROJECT_MANAGER edits task in a project they don\'t own', async () => {
      mockTaskRepo.findById.mockResolvedValue(mockTask); // projectId = 'proj-uuid-1'
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-uuid-1',
        ownerId: 'pm-uuid-1',
      });

      await expect(
        updateTaskUseCase.execute(
          'task-uuid-1',
          { title: 'Hacked title' },
          'pm-uuid-99', // different PM
          'PROJECT_MANAGER',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockTaskRepo.update).not.toHaveBeenCalled();
    });

    it('❌ should throw BadRequestException when new assignee is not a project member', async () => {
      mockTaskRepo.findById.mockResolvedValue(mockTask);
      mockPrisma.projectMember.findUnique.mockResolvedValue(null); // not a member

      await expect(
        updateTaskUseCase.execute(
          'task-uuid-1',
          { assigneeId: 'outsider-uuid' },
          'admin-uuid',
          'ADMIN',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockTaskRepo.update).not.toHaveBeenCalled();
    });
  });

  // ─── GetProjectTasksUseCase ──────────────────────────────────────────────────
  describe('GetProjectTasksUseCase', () => {
    it('✅ should return all tasks for a project', async () => {
      mockTaskRepo.findByProject.mockResolvedValue([mockTask]);

      const result = await getProjectTasksUseCase.execute('proj-uuid-1');

      expect(mockTaskRepo.findByProject).toHaveBeenCalledWith('proj-uuid-1');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Fix the bug');
    });

    it('✅ should return empty array if project has no tasks', async () => {
      mockTaskRepo.findByProject.mockResolvedValue([]);

      const result = await getProjectTasksUseCase.execute('proj-uuid-empty');
      expect(result).toHaveLength(0);
    });
  });

  // ─── GetMyTasksUseCase ───────────────────────────────────────────────────────
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

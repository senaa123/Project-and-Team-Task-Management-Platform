import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectUseCase } from '../src/modules/projects/application/use-cases/create-project.use-case';
import { AssignMemberUseCase } from '../src/modules/projects/application/use-cases/assign-member.use-case';
import { GetUserProjectsUseCase } from '../src/modules/projects/application/use-cases/get-user-projects.use-case';
import { GetProjectMembersUseCase } from '../src/modules/projects/application/use-cases/get-project-members.use-case';
import { PROJECT_REPOSITORY } from '../src/modules/projects/domain/repositories/project.repository.interface';

const mockProject = {
  id: 'proj-uuid-1',
  name: 'Test Project',
  description: 'A test project',
  ownerId: 'user-uuid-1',
  createdAt: new Date(),
};

describe('Projects Use Cases', () => {
  let createProjectUseCase: CreateProjectUseCase;
  let assignMemberUseCase: AssignMemberUseCase;
  let getUserProjectsUseCase: GetUserProjectsUseCase;
  let getProjectMembersUseCase: GetProjectMembersUseCase;

  const mockProjectRepo = {
    create: jest.fn(),
    findById: jest
      .fn()
      .mockResolvedValue({ id: 'proj-uuid-1', name: 'Test Project' }),
    findAllForUser: jest.fn(),
    addMember: jest.fn(),
    isMember: jest.fn().mockResolvedValue(false),
    getMembers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProjectUseCase,
        AssignMemberUseCase,
        GetUserProjectsUseCase,
        GetProjectMembersUseCase,
        { provide: PROJECT_REPOSITORY, useValue: mockProjectRepo },
      ],
    }).compile();

    createProjectUseCase =
      module.get<CreateProjectUseCase>(CreateProjectUseCase);
    assignMemberUseCase = module.get<AssignMemberUseCase>(AssignMemberUseCase);
    getUserProjectsUseCase = module.get<GetUserProjectsUseCase>(
      GetUserProjectsUseCase,
    );
    getProjectMembersUseCase = module.get<GetProjectMembersUseCase>(
      GetProjectMembersUseCase,
    );
    jest.clearAllMocks();
  });

  describe('CreateProjectUseCase', () => {
    it('✅ should create a project without members', async () => {
      mockProjectRepo.create.mockResolvedValue(mockProject);

      const result = await createProjectUseCase.execute(
        { name: 'Test Project', description: 'A test project' },
        'user-uuid-1',
      );

      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Project',
          ownerId: 'user-uuid-1',
        }),
      );
      expect(mockProjectRepo.addMember).not.toHaveBeenCalled();
      expect(result.id).toBe('proj-uuid-1');
    });

    it('✅ should create a project AND add initial members when memberIds provided', async () => {
      mockProjectRepo.create.mockResolvedValue(mockProject);
      mockProjectRepo.addMember.mockResolvedValue(undefined);

      await createProjectUseCase.execute(
        { name: 'Test Project', memberIds: ['user-uuid-2', 'user-uuid-3'] },
        'user-uuid-1',
      );

      expect(mockProjectRepo.addMember).toHaveBeenCalledTimes(2);
      expect(mockProjectRepo.addMember).toHaveBeenCalledWith(
        'proj-uuid-1',
        'user-uuid-2',
      );
      expect(mockProjectRepo.addMember).toHaveBeenCalledWith(
        'proj-uuid-1',
        'user-uuid-3',
      );
    });
  });

  describe('AssignMemberUseCase', () => {
    it('✅ should assign a member to a project', async () => {
      mockProjectRepo.findById.mockResolvedValue({
        id: 'proj-uuid-1',
        name: 'Test Project',
      });
      mockProjectRepo.isMember.mockResolvedValue(false);
      mockProjectRepo.addMember.mockResolvedValue(undefined);

      await assignMemberUseCase.execute('proj-uuid-1', 'user-uuid-2');

      expect(mockProjectRepo.addMember).toHaveBeenCalledWith(
        'proj-uuid-1',
        'user-uuid-2',
      );
    });
  });

  describe('GetUserProjectsUseCase', () => {
    it('✅ should return all projects for a user', async () => {
      mockProjectRepo.findAllForUser.mockResolvedValue([mockProject]);

      const result = await getUserProjectsUseCase.execute('user-uuid-1');

      expect(mockProjectRepo.findAllForUser).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Project');
    });

    it('✅ should return empty array if user has no projects', async () => {
      mockProjectRepo.findAllForUser.mockResolvedValue([]);

      const result = await getUserProjectsUseCase.execute('user-uuid-99');
      expect(result).toHaveLength(0);
    });
  });

  describe('GetProjectMembersUseCase', () => {
    it('✅ should return verified members for a project', async () => {
      const members = [
        { id: 'user-uuid-2', name: 'Alice', isVerified: true },
        { id: 'user-uuid-3', name: 'Bob', isVerified: true },
      ];
      mockProjectRepo.getMembers.mockResolvedValue(members);

      const result = await getProjectMembersUseCase.execute('proj-uuid-1');

      expect(mockProjectRepo.getMembers).toHaveBeenCalledWith('proj-uuid-1');
      expect(result).toHaveLength(2);
    });
  });
});

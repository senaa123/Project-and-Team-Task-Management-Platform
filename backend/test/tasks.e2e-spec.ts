import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

/**
 * E2E tests for the Tasks module.
 * Run with: npx jest --config ./test/jest-e2e.json --testPathPattern tasks --forceExit --verbose
 */
describe('Tasks API (e2e)', () => {
  let app: INestApplication;

  let adminToken: string;
  let memberToken: string;
  let adminUserId: string;
  let memberUserId: string;
  let projectId: string;
  let taskId: string;

  const ts = Date.now();
  const adminEmail = `tasks_admin_${ts}@test.com`;
  const memberEmail = `tasks_member_${ts}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // --- Seed: create users
    const adminReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Task Admin', email: adminEmail, password: 'Admin123!', role: 'ADMIN' });
    adminUserId = adminReg.body.id;

    const memberReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Task Member', email: memberEmail, password: 'Member123!' });
    memberUserId = memberReg.body.id;

    // --- Seed: login both
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'Admin123!' });
    adminToken = adminLogin.body.accessToken;

    const memberLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: memberEmail, password: 'Member123!' });
    memberToken = memberLogin.body.accessToken;

    // --- Seed: create a project for tasks
    const proj = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Task Test Project', description: 'Used by task e2e tests' });
    projectId = proj.body.id;

    // --- Seed: assign member to project
    await request(app.getHttpServer())
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: memberUserId });
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  //  TASKS — CREATE
  // ─────────────────────────────────────────────────────────────
  describe('POST /tasks', () => {
    it('✅ ADMIN should create a task with all fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          projectId,
          title: 'Implement login page',
          description: 'Build the login UI',
          priority: 'HIGH',
          assigneeId: memberUserId,
          dueDate: '2026-12-31',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Implement login page');
      expect(res.body.status).toBe('TODO'); // default
      expect(res.body.projectId).toBe(projectId);
      taskId = res.body.id;
    });

    it('✅ ADMIN should create a task with only required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectId, title: 'Minimal task' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Minimal task');
    });

    it('❌ TEAM_MEMBER cannot create a task (403)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ projectId, title: 'Member task attempt' })
        .expect(403);
    });

    it('❌ should fail without a token (401)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ projectId, title: 'No token task' })
        .expect(401);
    });

    it('❌ should fail with title shorter than 3 chars (400)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectId, title: 'AB' })
        .expect(400);
    });

    it('❌ should fail with an invalid projectId (not a UUID) (400)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectId: 'not-a-uuid', title: 'Bad project task' })
        .expect(400);
    });

    it('❌ should fail with a bad assigneeId (not a UUID) (400)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectId, title: 'Bad assignee', assigneeId: 'not-a-uuid' })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  TASKS — GET BY PROJECT
  // ─────────────────────────────────────────────────────────────
  describe('GET /tasks/project/:projectId', () => {
    it('✅ ADMIN should list tasks for a project', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/project/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((t: any) => t.id === taskId);
      expect(found).toBeDefined();
    });

    it('✅ TEAM_MEMBER can list tasks for a project', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/project/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('❌ should fail without a token (401)', async () => {
      await request(app.getHttpServer())
        .get(`/tasks/project/${projectId}`)
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  TASKS — UPDATE STATUS
  // ─────────────────────────────────────────────────────────────
  describe('PATCH /tasks/:id/status', () => {
    it('✅ ADMIN can update any task status to IN_PROGRESS', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      expect(res.body.status).toBe('IN_PROGRESS');
    });

    it('✅ ADMIN can update task status to IN_REVIEW', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_REVIEW' })
        .expect(200);

      expect(res.body.status).toBe('IN_REVIEW');
    });

    it('✅ ADMIN can update task status to DONE', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DONE' })
        .expect(200);

      expect(res.body.status).toBe('DONE');
    });

    it('✅ ADMIN can reset task status back to TODO', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'TODO' })
        .expect(200);

      expect(res.body.status).toBe('TODO');
    });

    it('✅ TEAM_MEMBER can update status of a task assigned to them', async () => {
      // taskId has memberUserId as assignee from the seed
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      expect(res.body.status).toBe('IN_PROGRESS');
    });

    it('❌ TEAM_MEMBER cannot update status of a task NOT assigned to them (403)', async () => {
      // Create a task with no assignee
      const unassigned = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectId, title: 'Unassigned task' });

      await request(app.getHttpServer())
        .patch(`/tasks/${unassigned.body.id}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(403);
    });

    it('❌ should fail with an invalid status value (400)', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('❌ should fail for a non-existent task id (404)', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DONE' })
        .expect(404);
    });

    it('❌ should fail without a token (401)', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .send({ status: 'DONE' })
        .expect(401);
    });
  });
});

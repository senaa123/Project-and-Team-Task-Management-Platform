import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

/**
 * End-to-end tests for the Task Management Platform API.
 * Run with: npx jest --config ./test/jest-e2e.json
 *
 * The test spins up its own Nest app instance against the real DB.
 * Stop any running dev server before running these tests.
 */
describe('Task Management API (e2e)', () => {
  let app: INestApplication;

  // Shared state across tests
  let adminToken: string;
  let memberToken: string;
  let adminUserId: string;
  let memberUserId: string;
  let createdProjectId: string;

  // Unique emails per test run to avoid DB conflicts
  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@test.com`;
  const memberEmail = `member_${timestamp}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  //  AUTH — REGISTER
  // ─────────────────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    it('✅ should register an ADMIN user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test Admin',
          email: adminEmail,
          password: 'Admin123!',
          role: 'ADMIN',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(adminEmail);
      expect(res.body.role).toBe('ADMIN');
      adminUserId = res.body.id;
    });

    it('✅ should register a TEAM_MEMBER (default role)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test Member',
          email: memberEmail,
          password: 'Member123!',
        })
        .expect(201);

      expect(res.body.role).toBe('TEAM_MEMBER');
      memberUserId = res.body.id;
    });

    it('❌ should fail with a duplicate email (409)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Duplicate',
          email: adminEmail,
          password: 'Admin123!',
          role: 'ADMIN',
        })
        .expect(409);
    });

    it('❌ should fail with an invalid email format (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Bad Email',
          email: 'not-an-email',
          password: 'Admin123!',
        })
        .expect(400);
    });

    it('❌ should fail when password is too short < 6 chars (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Short Pass',
          email: `short_${timestamp}@test.com`,
          password: '123',
        })
        .expect(400);
    });

    it('❌ should fail with an invalid role value (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Bad Role',
          email: `badrole_${timestamp}@test.com`,
          password: 'Admin123!',
          role: 'SUPERUSER',
        })
        .expect(400);
    });

    it('❌ should fail when name is missing (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: `noname_${timestamp}@test.com`, password: 'Admin123!' })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  AUTH — LOGIN
  // ─────────────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('✅ should login as ADMIN and return a JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: adminEmail, password: 'Admin123!' })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.role).toBe('ADMIN');
      adminToken = res.body.accessToken;
    });

    it('✅ should login as TEAM_MEMBER and return a JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: memberEmail, password: 'Member123!' })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      memberToken = res.body.accessToken;
    });

    it('❌ should fail with wrong password (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: adminEmail, password: 'WrongPassword!' })
        .expect(401);
    });

    it('❌ should fail with unknown email (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'Admin123!' })
        .expect(401);
    });

    it('❌ should fail with missing fields (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: adminEmail })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  PROJECTS — CREATE
  // ─────────────────────────────────────────────────────────────
  describe('POST /projects', () => {
    it('✅ ADMIN should create a project successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'E2E Test Project', description: 'Created by e2e test' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('E2E Test Project');
      expect(res.body.ownerId).toBe(adminUserId);
      createdProjectId = res.body.id;
    });

    it('✅ ADMIN can create a project without a description (optional field)', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'No Desc Project' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
    });

    it('❌ TEAM_MEMBER should be forbidden from creating a project (403)', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Unauthorized Project' })
        .expect(403);
    });

    it('❌ should fail with no Authorization header (401)', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'No Token Project' })
        .expect(401);
    });

    it('❌ should fail with a project name shorter than 3 chars (400)', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'AB' })
        .expect(400);
    });

    it('❌ should fail with a fake/malformed token (401)', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', 'Bearer this.is.not.valid')
        .send({ name: 'Fake Token Project' })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  PROJECTS — GET MY PROJECTS
  // ─────────────────────────────────────────────────────────────
  describe('GET /projects', () => {
    it('✅ ADMIN should see their own projects list', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((p: any) => p.id === createdProjectId);
      expect(found).toBeDefined();
    });

    it('✅ TEAM_MEMBER can call the endpoint (returns their assigned projects)', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('❌ should fail with no Authorization header (401)', async () => {
      await request(app.getHttpServer()).get('/projects').expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  PROJECTS — ASSIGN MEMBER
  // ─────────────────────────────────────────────────────────────
  describe('POST /projects/:id/members', () => {
    it('✅ ADMIN should assign a member to their project', async () => {
      const res = await request(app.getHttpServer())
        .post(`/projects/${createdProjectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: memberUserId })
        .expect(201);

      expect(res.body).toBeDefined();
    });

    it('❌ TEAM_MEMBER cannot assign other members (403)', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${createdProjectId}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ userId: memberUserId })
        .expect(403);
    });

    it('❌ should fail with a non-UUID userId (400)', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${createdProjectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: 'not-a-uuid' })
        .expect(400);
    });

    it('❌ should fail with no Authorization header (401)', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${createdProjectId}/members`)
        .send({ userId: memberUserId })
        .expect(401);
    });
  });
});

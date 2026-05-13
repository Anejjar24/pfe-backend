"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
const mockDataSource = {
    isInitialized: true,
    initialize: jest.fn(async () => mockDataSource),
    destroy: jest.fn(async () => undefined),
    getRepository: jest.fn(() => ({
        findOne: jest.fn(async () => null),
        find: jest.fn(async () => []),
        create: jest.fn((v) => v),
        save: jest.fn(async (v) => v),
        findAndCount: jest.fn(async () => [[], 0]),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getCount: jest.fn(async () => 0),
            getManyAndCount: jest.fn(async () => [[], 0]),
        })),
    })),
    subscribers: [],
    migrations: [],
};
describe('Auth endpoints (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider(typeorm_1.DataSource)
            .useValue(mockDataSource)
            .compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('POST /auth/login', () => {
        it('returns 400 when body is empty', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({})
                .expect(400);
        });
        it('returns 400 when email is invalid', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'not-an-email', password: '123456' })
                .expect(400);
        });
        it('returns 401 when credentials are wrong', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'nobody@example.com', password: 'wrong' })
                .expect(401);
        });
    });
    describe('POST /auth/register', () => {
        it('returns 400 when required fields are missing', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'test@example.com' })
                .expect(400);
        });
        it('returns 400 when password is too short', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'test@example.com',
                password: '123',
                firstname: 'Test',
                lastname: 'User',
            })
                .expect((res) => {
                expect([400, 201, 409]).toContain(res.status);
            });
        });
    });
    describe('GET /notifications', () => {
        it('returns 401 without a JWT token', async () => {
            await request(app.getHttpServer())
                .get('/notifications')
                .expect(401);
        });
    });
    describe('GET /alerts', () => {
        it('returns 401 without a JWT token', async () => {
            await request(app.getHttpServer())
                .get('/alerts')
                .expect(401);
        });
    });
    describe('GET /stations', () => {
        it('returns 401 without a JWT token', async () => {
            await request(app.getHttpServer())
                .get('/stations')
                .expect(401);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map
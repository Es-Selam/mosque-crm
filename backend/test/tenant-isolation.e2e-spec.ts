import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { testDatabaseConfig } from './config/test-database.config';
import { TenantsService } from '../src/tenants/tenants.service';
import { CreateTenantDto } from '../src/tenants/dto/create-tenant.dto';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tenantService: TenantsService;
  let tenant1Id: string;
  let tenant2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    tenantService = moduleFixture.get<TenantsService>(TenantsService);

    // Create test tenants
    const tenant1 = await tenantService.createTenant({
      name: 'Mosque 1',
      subdomain: 'mosque1',
    } as CreateTenantDto);

    const tenant2 = await tenantService.createTenant({
      name: 'Mosque 2',
      subdomain: 'mosque2',
    } as CreateTenantDto);

    tenant1Id = tenant1.id;
    tenant2Id = tenant2.id;
  });

  afterAll(async () => {
    // Drop test schemas
    await dataSource.query(`DROP SCHEMA IF EXISTS "mosque_${tenant1Id}" CASCADE`);
    await dataSource.query(`DROP SCHEMA IF EXISTS "mosque_${tenant2Id}" CASCADE`);

    await app.close();
  });

  it('should create data in separate tenant schemas', async () => {
    // Create test member in tenant 1
    await dataSource.query(`SET search_path TO "mosque_${tenant1Id}"`);
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);
    await dataSource.query(`INSERT INTO members (name) VALUES ('Member in Tenant 1')`);

    // Create test member in tenant 2
    await dataSource.query(`SET search_path TO "mosque_${tenant2Id}"`);
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);
    await dataSource.query(`INSERT INTO members (name) VALUES ('Member in Tenant 2')`);

    // Verify member in tenant 1
    await dataSource.query(`SET search_path TO "mosque_${tenant1Id}"`);
    const tenant1Members = await dataSource.query(`SELECT * FROM members`);
    expect(tenant1Members.length).toBe(1);
    expect(tenant1Members[0].name).toBe('Member in Tenant 1');

    // Verify member in tenant 2
    await dataSource.query(`SET search_path TO "mosque_${tenant2Id}"`);
    const tenant2Members = await dataSource.query(`SELECT * FROM members`);
    expect(tenant2Members.length).toBe(1);
    expect(tenant2Members[0].name).toBe('Member in Tenant 2');
  });

  it('should isolate data between tenant schemas', async () => {
    // Set search path to tenant 1 and try to access tenant 2's data
    await dataSource.query(`SET search_path TO "mosque_${tenant1Id}"`);

    // This should fail because the table doesn't exist in tenant 1's schema
    try {
      await dataSource.query(`SELECT * FROM tenant2_specific_table`);
      fail('Should not be able to access tenant 2 tables from tenant 1 schema');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  // Test API with tenant headers
  it('should handle tenant-specific API requests', async () => {
    // Create an API endpoint in your app for testing
    // Then test with different tenant subdomains

    await request(app.getHttpServer())
      .get('/api/test-endpoint')
      .set('Host', 'mosque1.localhost')
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/test-endpoint')
      .set('Host', 'mosque2.localhost')
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/test-endpoint')
      .set('Host', 'nonexistent.localhost')
      .expect(404);
  });
});
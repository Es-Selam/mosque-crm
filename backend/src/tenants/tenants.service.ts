import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private connection: DataSource,
  ) {}

  async getTenantIdFromHostname(hostname: string): Promise<string | null> {
    // Extract subdomain or use custom domain
    let subdomain = hostname.split('.')[0];
    if (hostname.includes('localhost')) {
      // For local development, extract from url format: tenant-subdomain.localhost:3000
      subdomain = hostname.split('.')[0];
    }

    const tenant = await this.tenantRepository.findOne({
      where: [
        { subdomain },
        { customDomain: hostname },
      ],
    });

    return tenant?.id || null;
  }

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    await this.tenantRepository.save(tenant);

    // Create schema for tenant
    await this.createTenantSchema(tenant.id);

    return tenant;
  }

  private async createTenantSchema(tenantId: string): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create schema
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "mosque_${tenantId}"`);

      // Set search path to new schema
      await queryRunner.query(`SET search_path TO "mosque_${tenantId}"`);

      // Create tenant tables in schema
      // You'll add entity-specific migrations here

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
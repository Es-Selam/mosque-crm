import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TenantsService } from '../tenants.service';
import { Tenant } from '../entities/tenant.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateTenantDto } from '../dto/create-tenant.dto';

describe('TenantsService', () => {
  let service: TenantsService;
  let tenantRepository: Repository<Tenant>;
  let dataSource: DataSource;

  const mockTenantRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      query: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenantIdFromHostname', () => {
    it('should extract subdomain from hostname and find tenant', async () => {
      const mockTenant = { id: 'tenant-123', subdomain: 'mosque1' };
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getTenantIdFromHostname('mosque1.example.com');

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: [
          { subdomain: 'mosque1' },
          { customDomain: 'mosque1.example.com' },
        ],
      });
      expect(result).toEqual('tenant-123');
    });

    it('should handle localhost with tenant prefix', async () => {
      const mockTenant = { id: 'tenant-123', subdomain: 'mosque1' };
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getTenantIdFromHostname('mosque1.localhost:3000');

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: [
          { subdomain: 'mosque1' },
          { customDomain: 'mosque1.localhost:3000' },
        ],
      });
      expect(result).toEqual('tenant-123');
    });

    it('should return null when tenant not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      const result = await service.getTenantIdFromHostname('nonexistent.example.com');

      expect(result).toBeNull();
    });
  });

  describe('createTenant', () => {
    it('should create tenant and schema', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Mosque',
        subdomain: 'testmosque',
      };

      const mockTenant = {
        id: 'tenant-123',
        ...createTenantDto,
      };

      mockTenantRepository.create.mockReturnValue(mockTenant);
      mockTenantRepository.save.mockResolvedValue(mockTenant);

      const createTenantSchemaSpy = jest.spyOn(service as any, 'createTenantSchema').mockResolvedValue(undefined);

      const result = await service.createTenant(createTenantDto);

      expect(mockTenantRepository.create).toHaveBeenCalledWith(createTenantDto);
      expect(mockTenantRepository.save).toHaveBeenCalledWith(mockTenant);
      expect(createTenantSchemaSpy).toHaveBeenCalledWith('tenant-123');
      expect(result).toEqual(mockTenant);
    });
  });

  describe('createTenantSchema', () => {
    it('should create schema and run migrations', async () => {
      const queryRunner = mockDataSource.createQueryRunner();

      await (service as any).createTenantSchema('tenant-123');

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.query).toHaveBeenCalledWith('CREATE SCHEMA IF NOT EXISTS "mosque_tenant-123"');
      expect(queryRunner.query).toHaveBeenCalledWith('SET search_path TO "mosque_tenant-123"');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.query.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect((service as any).createTenantSchema('tenant-123')).rejects.toThrow('Database error');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
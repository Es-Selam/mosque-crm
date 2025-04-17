import { Test, TestingModule } from '@nestjs/testing';
import { TenantMiddleware } from '../middleware/tenant.middleware';
import { TenantsService } from '../tenants.service';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let tenantService: TenantsService;
  let dataSource: DataSource;

  const mockTenantService = {
    getTenantIdFromHostname: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMiddleware,
        {
          provide: TenantsService,
          useValue: mockTenantService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
    tenantService = module.get<TenantsService>(TenantsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should set tenant context and continue', async () => {
      const req = { headers: { host: 'mosque1.example.com' } };
      const res = {};
      const next = jest.fn();

      mockTenantService.getTenantIdFromHostname.mockResolvedValue('tenant-123');

      await middleware.use(req as any, res as any, next);

      expect(mockTenantService.getTenantIdFromHostname).toHaveBeenCalledWith('mosque1.example.com');
      expect(req['tenantId']).toEqual('tenant-123');
      expect(mockDataSource.query).toHaveBeenCalledWith('SET search_path TO "mosque_tenant-123"');
      expect(next).toHaveBeenCalled();
    });

    it('should throw NotFoundException when tenant not found', async () => {
      const req = { headers: { host: 'nonexistent.example.com' } };
      const res = {};
      const next = jest.fn();

      mockTenantService.getTenantIdFromHostname.mockResolvedValue(null);

      await expect(middleware.use(req as any, res as any, next)).rejects.toThrow(NotFoundException);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
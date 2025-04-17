// src/tenants/tests/tenants.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { TenantsController } from '../tenants.controller';
import { TenantsService } from '../tenants.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: TenantsService;

  const mockTenantsService = {
    createTenant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    service = module.get<TenantsService>(TenantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Mosque',
        subdomain: 'testmosque',
      };

      const mockTenant = {
        id: 'tenant-123',
        ...createTenantDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTenantsService.createTenant.mockResolvedValue(mockTenant);

      const result = await controller.create(createTenantDto);

      expect(mockTenantsService.createTenant).toHaveBeenCalledWith(createTenantDto);
      expect(result).toEqual(mockTenant);
    });

    // Add additional tests for validation, error handling, etc.
  });
});
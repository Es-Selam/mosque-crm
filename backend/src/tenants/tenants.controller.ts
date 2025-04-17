// src/tenants/tenants.controller.ts
import { Controller, Post, Body, HttpStatus, HttpCode, ValidationPipe, UsePipes, BadRequestException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createTenantDto: CreateTenantDto) {
    // Validate the subdomain format
    this.validateSubdomain(createTenantDto.subdomain);

    // Create the tenant using the service
    const tenant = await this.tenantsService.createTenant(createTenantDto);

    return tenant;
  }

  private validateSubdomain(subdomain: string): void {
    const subdomainRegex = /^[a-z][a-z0-9-]{1,61}[a-z0-9]$/;

    if (!subdomainRegex.test(subdomain)) {
      throw new BadRequestException(
        'Subdomain must contain only lowercase letters, numbers, and hyphens, ' +
        'start with a letter, end with a letter or number, and be between 3-63 characters.'
      );
    }
  }
}
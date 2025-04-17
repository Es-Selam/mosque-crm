import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../tenants.service';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantsService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const hostname = req.headers.host || '';
    const tenantId = await this.tenantService.getTenantIdFromHostname(hostname);

    if (!tenantId) {
      throw new NotFoundException('Tenant not found');
    }

    req['tenantId'] = tenantId;

    // Set PostgreSQL search_path to tenant schema
    await this.dataSource.query(`SET search_path TO "mosque_${tenantId}"`);

    next();
  }
}
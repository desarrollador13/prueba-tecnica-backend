import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service'; 
import { HealthResponse } from '../dtos/health-response';
import { HealthMapper } from '../mappers/health.mapper';

@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) {}

    async checkDatabaseConnection(): Promise<HealthResponse> {
        let database: string;
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            database = 'connected';
        } catch (error) {
            console.error('Database connection failed:', error);
            database = 'disconnected';
        };
        const uptime = Math.floor(process.uptime());
        return HealthMapper.toResponse(database, uptime);
    }
}

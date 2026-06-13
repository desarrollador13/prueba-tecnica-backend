import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

import { Request } from 'express';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    
    constructor(private prisma: PrismaService) {} 

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const req = context.switchToHttp().getRequest<Request>();
        const apiKey = req.headers['x-api-key'] as string;
        if (!apiKey) throw new UnauthorizedException('API Key header is missing');
        const merchant = await this.prisma.merchant.findUnique({ where: { apiKey } });
        if (!merchant) throw new ForbiddenException('Invalid API key');

        if (merchant.status !== 'active') throw new ForbiddenException('Merchant account is inactive');
        req.merchant = merchant;
        return true;    
        
    }

}
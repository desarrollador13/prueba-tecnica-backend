import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateTransactionDto } from '../dtos/requests/create-transaction.dto';
import { TransactionPageRequest } from '../dtos/requests/transaction-page.request';
import { TransactionMapper } from '../mappers/transaction.mapper';
import { TransactionPageResponse } from '../dtos/responses/transaction-page.response';
import { TransactionDetailResponse } from '../dtos/responses/transaction-detail.response';
import { validateStatusChange } from '../common/transaction-status-validator';
import { TransactionResponse } from '../dtos/responses/transaction-response.dto';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) {}

    private generateReference(): string {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN-${datePart}-${randomPart}`;
    }

    async create(dto: CreateTransactionDto, merchantId: string): Promise<TransactionResponse> {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant) throw new NotFoundException('Comercio no encontrado');

        let reference = '';
        let isUnique = false;
        while (!isUnique) {
            reference = this.generateReference();
            const existing = await this.prisma.transaction.findUnique({ where: { reference } });
            if (!existing) isUnique = true;
        }
        const transaction = await this.prisma.transaction.create({ data: { ...dto, reference, status: 'pending' } });
        return TransactionMapper.toResponse(transaction);
    }

    async findAll(query: TransactionPageRequest): Promise<TransactionPageResponse> {
        const { page, limit, status, type, date_from, date_to } = query;
        const take = Math.min(limit || 20, 100);
        const skip = ((page || 1) - 1) * take;

        const where: any = {
            status,
            type,
            createdAt: {
                gte: date_from ? new Date(date_from) : undefined,
                lte: date_to ? new Date(date_to) : undefined,
            },
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return TransactionMapper.toPageResponse(data, total, page, take); 
    }

    async findOne(id: string): Promise<TransactionDetailResponse> {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
  
        if (!transaction) {
            throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
        }
        return TransactionMapper.toDetailResponse(transaction);
    }

    async updateStatus(id: string, status: TransactionStatus): Promise<TransactionDetailResponse> {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!transaction) throw new NotFoundException(' Transacción no encontrada ');
        validateStatusChange(transaction.status, status);

        const updatedTransaction = await this.prisma.transaction.update({
            where: { id }, data: { status },
        });
        return TransactionMapper.toDetailResponse(updatedTransaction);
    }

}

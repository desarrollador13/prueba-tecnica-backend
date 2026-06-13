import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service'; 
import { CreateSettlementDto } from '../dtos/create-settlement.dto';
import { randomUUID } from 'crypto';
import { SettlementStatus } from '@prisma/client';
import { SettlementResponseDto } from '../dtos/settlement-response.dto';
import { SettlementMapper } from '../mappers/settlement.mapper';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: CreateSettlementDto): Promise<SettlementResponseDto> {
    return await this.prisma.$transaction(async (sql) => {
      const period_start = new Date(dto.period_start), period_end = new Date(dto.period_end);
      period_start.setUTCHours(0, 0, 0, 0);
      period_end.setUTCHours(23, 59, 59, 999);
      const transactions = await sql.transaction.findMany({
        where: {
          merchantId: dto.merchant_id,
          status: 'approved',
          settlementTransaction: {
            is: null, 
          },
          createdAt: { gte: period_start, lte: period_end },
        },
      });

      if (transactions.length === 0) {
        throw new NotFoundException('There are no transactions eligible for settlement during this period.');
      }

      const totalAmount = transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const settlement = await sql.settlement.create({
        data: {
          id: randomUUID(),
          merchantId: dto.merchant_id,
          totalAmount: totalAmount,
          transactionCount: transactions.length,
          status: SettlementStatus.processed,
          periodStart: new Date(dto.period_start),
          periodEnd: new Date(dto.period_end),
        },
      });

      await sql.settlementTransaction.createMany({
        data: transactions.map((transaction) => ({ settlementId: settlement.id, transactionId: transaction.id,})),
      });

      return SettlementMapper.toDto(settlement);
    });
  }

  async getById(id: string): Promise<SettlementResponseDto> {
    try {
      const settlement = await this.prisma.settlement.findUnique({
        where: { id }, include: { transactions: true }, 
      });
      if (!settlement) {  
        throw new NotFoundException(`Settlement  ${id} not found`);
      }

      return SettlementMapper.toDto(settlement);
    } catch (error) {
      throw new InternalServerErrorException('internal server error occurred');
    }
  }
}

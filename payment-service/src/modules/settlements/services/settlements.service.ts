import { Injectable, NotFoundException } from '@nestjs/common';
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
      const transactions = await sql.transaction.findMany({
        where: {
          merchantId: dto.merchant_id,
          status: 'approved',
          settlementTransaction: null,
          createdAt: { gte: new Date(dto.period_start), lte: new Date(dto.period_end) },
        },
      });

      if (transactions.length === 0) {
        throw new NotFoundException('No hay transacciones elegibles para liquidar en este periodo.');
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
        data: transactions.map((transaction) => ({
            settlementId: settlement.id,
            transactionId: transaction.id,
        })),
      });

      // await sql.transaction.updateMany({
      //   where: { id: { in: transactions.map((transaction) => transaction.id) } },
      //   data: { settlementId: settlement.id },
      // });

      return SettlementMapper.toDto(settlement);
    });
  }

  async getById(id: string): Promise<SettlementResponseDto> {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id },
      include: { transactions: true }, 
    });
    if (!settlement) {  
      throw new NotFoundException(`Liquidación ${id} no encontrada`);
    }

    return SettlementMapper.toDto(settlement);
  }
}

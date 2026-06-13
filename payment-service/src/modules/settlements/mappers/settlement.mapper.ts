import { Settlement } from '@prisma/client';
import { SettlementResponseDto } from '../dtos/settlement-response.dto';

export class SettlementMapper {
    static toDto(entity: Settlement): SettlementResponseDto {
        return {
        id: entity.id,
        merchantId: entity.merchantId,
        totalAmount: Number(entity.totalAmount), 
        transactionCount: entity.transactionCount,
        status: entity.status,
        periodStart: entity.periodStart,
        periodEnd: entity.periodEnd,
        };
    }
}
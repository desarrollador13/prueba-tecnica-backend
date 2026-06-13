import { Transaction } from "@prisma/client";
import { TransactionPageResponse } from "../dtos/responses/transaction-page.response";
import { TransactionDetailResponse } from "../dtos/responses/transaction-detail.response";
import { TransactionResponse } from "../dtos/responses/transaction-response.dto";

export class TransactionMapper {

  static toPageResponse(data: any[], total: number, page: number, limit: number): TransactionPageResponse {
    return {
        data,
        meta: {
            total,
            page: Number(page),
            limit: limit,
            total_pages: Math.ceil(total / limit),
        },
    };
  }

  static toDetailResponse(entity: Transaction): TransactionDetailResponse {
    return {
      id: entity.id,
      reference: entity.reference,
      amount: Number(entity.amount), 
      currency: entity.currency,
      type: entity.type,
      status: entity.status,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  static toResponse(entity: Transaction): TransactionResponse {
    return {
      id: entity.id,
      reference: entity.reference,
      amount: Number(entity.amount), 
      currency: entity.currency,
      type: entity.type,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}


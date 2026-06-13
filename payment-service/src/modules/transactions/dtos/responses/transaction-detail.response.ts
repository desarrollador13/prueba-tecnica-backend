import { Transaction, TransactionStatus, TransactionType, TransactionCurrency } from '@prisma/client';

export class TransactionDetailResponse {
    id: string;
    reference: string;
    amount: number;
    currency: TransactionCurrency;
    type: TransactionType;
    status: TransactionStatus;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
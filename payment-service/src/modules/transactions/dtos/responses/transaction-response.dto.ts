import { TransactionStatus, TransactionType, TransactionCurrency } from '@prisma/client';

export class TransactionResponse {
  id: string;
  reference: string;
  amount: number;
  currency: TransactionCurrency;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
}

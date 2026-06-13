import { Transaction } from '@prisma/client';

export class TransactionPageResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

import { TransactionStatus } from '@prisma/client';
import { UnprocessableEntityException } from '@nestjs/common';

export function validateStatusChange(current: TransactionStatus, next: TransactionStatus) {
   const invalidTransitions: Record<TransactionStatus, TransactionStatus[]> = {
    pending: [], 
    approved: ['pending', 'rejected'], 
    rejected: ['pending', 'approved', 'completed', 'failed'],
    failed: ['pending', 'approved', 'completed', 'rejected'], 
    completed: ['pending', 'approved', 'rejected', 'failed'], 
  };

  if (invalidTransitions[current].includes(next)) {
    throw new UnprocessableEntityException(
      `No es posible cambiar el estado de '${current}' a '${next}'`
    );
  }
}   
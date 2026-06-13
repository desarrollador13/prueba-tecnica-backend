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
      `It is not possible to change the state of '${current}' a '${next}'`
    );
  }
}   
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateStatusRequest {
    @IsNotEmpty()
    @IsEnum(TransactionStatus)
    status: TransactionStatus;
}

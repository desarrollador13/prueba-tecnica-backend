import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min, IsNotEmpty } from 'class-validator';
import { TransactionCurrency, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsNumber()
  @Min(0.01, { message: 'The amount must be greater than 0' })
  amount: number;

  @IsEnum(TransactionCurrency)
  currency: TransactionCurrency;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
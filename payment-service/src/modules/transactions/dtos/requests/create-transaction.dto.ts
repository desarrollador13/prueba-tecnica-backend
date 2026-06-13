import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min, IsNotEmpty } from 'class-validator';
import { TransactionCurrency, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @IsEnum(TransactionCurrency)
  currency: TransactionCurrency;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
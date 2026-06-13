import { IsUUID, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateSettlementDto {
  @IsUUID()
  merchant_id: string;

  @Transform(({ value }) => {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0); 
    return date.toISOString();
  })
  @IsISO8601()
  period_start: string;

  @Transform(({ value }) => {
    const date = new Date(value);
    date.setUTCHours(23, 59, 59, 999);
    return date.toISOString();
  })
  @IsISO8601()
  period_end: string;
}
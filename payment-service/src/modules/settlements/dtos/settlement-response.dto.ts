export class SettlementResponseDto {
  id: string;
  merchantId: string;
  totalAmount: number;
  transactionCount: number;
  status: string;
  periodStart: Date;
  periodEnd: Date;
}
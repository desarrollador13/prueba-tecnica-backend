
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SettlementsService } from '../services/settlements.service';
import { CreateSettlementDto } from '../dtos/create-settlement.dto';

@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('generate')
  async generate(@Body() createSettlementDto: CreateSettlementDto) {
    return await this.settlementsService.generate(createSettlementDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.settlementsService.getById(id);
  }
}

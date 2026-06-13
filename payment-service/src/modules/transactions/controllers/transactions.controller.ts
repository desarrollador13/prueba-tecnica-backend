import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Query, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dtos/requests/create-transaction.dto';
import { TransactionPageRequest } from '../dtos/requests/transaction-page.request';
import { TransactionDetailResponse } from '../dtos/responses/transaction-detail.response';
import { TransactionPageResponse } from '../dtos/responses/transaction-page.response';
import { UpdateStatusRequest } from '../dtos/requests/update-status.request';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentMerchant } from '../common/decorators/current-merchant.decorator';
import type { Merchant } from '@prisma/client';

@UseGuards(ApiKeyGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get()
    async findAll(@Query() request: TransactionPageRequest): Promise<TransactionPageResponse> {
        return await this.transactionsService.findAll(request);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<TransactionDetailResponse> {
        return await this.transactionsService.findOne(id);
    }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async create(@Body() createTransactionDto: CreateTransactionDto, @CurrentMerchant() merchant: Merchant) {
        return await this.transactionsService.create(createTransactionDto, merchant.id);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() request: UpdateStatusRequest): Promise<TransactionDetailResponse> {
        return await this.transactionsService.updateStatus(id, request.status);
    }
}

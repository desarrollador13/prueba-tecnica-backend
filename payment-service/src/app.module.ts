import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infra/prisma/prisma.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { HealthModule } from './modules/health/health.module';


@Module({
  imports: [PrismaModule, SettlementsModule, TransactionsModule, HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    }
  ],

})
export class AppModule {}



import { Module } from '@nestjs/common';
import { SettlementsController } from './controllers/settlements.controller';
import { SettlementsService } from './services/settlements.service';
import { PrismaModule } from './../../infra/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SettlementsController],
  providers: [SettlementsService]
})
export class SettlementsModule {}

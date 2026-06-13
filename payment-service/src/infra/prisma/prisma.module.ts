import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SettlementsModule } from './../../modules/settlements/settlements.module';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

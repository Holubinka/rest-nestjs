import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, FileService],
  exports: [FileService],
})
export class FileModule {}

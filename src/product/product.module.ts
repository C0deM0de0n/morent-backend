import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleCloudService } from 'src/upload-files/google-cloud.service';

@Module({
  imports: [ConfigModule],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, GoogleCloudService],
})
export class ProductModule {}

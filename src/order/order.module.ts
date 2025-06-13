import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from 'src/prisma.service';
import { ProductModule } from 'src/product/product.module';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ProductModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, StripeService, ConfigService],
})
export class OrderModule {}

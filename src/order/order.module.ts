import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { StripeService } from 'src/libs/stripe/stripe.service'
import { ProductModule } from 'src/product/product.module'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'

@Module({
	imports: [ProductModule],
	controllers: [OrderController],
	providers: [OrderService, StripeService, ConfigService],
})
export class OrderModule {}

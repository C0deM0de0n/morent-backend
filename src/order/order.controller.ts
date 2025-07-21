import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import { Authorization } from 'src/decorators/auth.decorator'
import { Authorized } from 'src/decorators/authorized.decorator'
import { OrderService } from './order.service'
import { CreateOrderDto, ConfirmOrderDto } from './dto/order.dto'
import type { IPaymentIntent } from './types/payment.types'
import type { Order } from 'generated/prisma'

@Controller('order')
export class OrderController {
	public constructor(
		private readonly orderService: OrderService
	) {}

	@Get('get-all')
	@Authorization('USER')
	@HttpCode(200)
	public async getOrders(
		@Authorized('id') userId: string
	): Promise<Order[]> {
		return this.orderService.getOrders(userId)
	}

	@Post('intent')
	@Authorization('USER')
	public async createPaymentIntent(
		@Authorized('id') userId: string, 
		@Body() dto: CreateOrderDto
	): Promise<IPaymentIntent> {
		return this.orderService.createPaymentIntent(dto)
	}

	@Post('create')
	@Authorization('USER')
	@HttpCode(200)
	public async create(
		@Authorized('id') userId: string, 
		@Body() dto: ConfirmOrderDto
	): Promise<Order> {
		return this.orderService.createOrder(userId, dto)
	}
}

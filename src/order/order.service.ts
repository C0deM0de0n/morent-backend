import {
	BadGatewayException,
	ConflictException,
	Injectable,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProductService } from 'src/product/product.service'
import { CreateOrderDto } from './dto/order.dto'
import { Orders } from 'generated/prisma'

@Injectable()
export class OrderService {
	constructor(
		private prismaService: PrismaService,
		private productService: ProductService
	) {}

	async getOrders(userId: string): Promise<Orders[]> {
		return this.prismaService.orders.findMany({
			where: { userId },
			include: { product: true }
		})
	}

	async createOrder(userId: string, dto: CreateOrderDto): Promise<Orders> {
		const { productId, pickUp, dropOff, locationPick, locationDrop } = dto

		const product = await this.productService.getById(productId)

		const pickUpDate = new Date(pickUp)
		const dropOffDate = new Date(dropOff)

		if (pickUpDate >= dropOffDate)
			throw new BadGatewayException('Invalid date range')

		const overlappingOrders = await this.prismaService.orders.count({
			where: {
				productId,
				OR: [
					{
						pickUp: { lt: dropOffDate },
						dropOff: { gt: pickUpDate },
					},
				],
			},
		})

		if (overlappingOrders >= product.quantity) {
			throw new ConflictException('No available cars for selected dates')
		}

		const order = await this.prismaService.orders.create({
			data: {
				userId,
				productId,
				pickUp: pickUpDate,
				dropOff: dropOffDate,
				locationPick,
				locationDrop,
			},
		})

		return order
	}
}

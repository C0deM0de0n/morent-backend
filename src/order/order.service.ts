import {
	BadGatewayException,
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProductService } from 'src/product/product.service'
import { ConfirmOrderDto, CreateOrderDto } from './dto/order.dto'
import Stripe from 'stripe'
import { Orders } from 'generated/prisma'
import { StripeService } from 'src/stripe/stripe.service'

@Injectable()
export class OrderService {
	constructor(
		private prismaService: PrismaService,
		private productService: ProductService,
		private stripeService: StripeService
	) {}

	async getOrders(userId: string): Promise<Orders[]> {
		return this.prismaService.orders.findMany({
			where: { userId, deletedAt: null },
			include: { product: true },
		})
	}

	async createPaymentIntent(dto: CreateOrderDto) {
		const { productId, pickUp, dropOff, currency } = dto
		const product = await this.productService.getById(productId)

		const pickUpDate = new Date(pickUp)
		const dropOffDate = new Date(dropOff)

		const amount =
			this.calculateRentalPrice(pickUpDate, dropOffDate, product.price) * 100

		const paymentIntent = await this.stripeService.createPaymentIntent(
			amount,
			currency
		)

		return paymentIntent
	}

	async createOrder(userId: string, dto: ConfirmOrderDto): Promise<Orders> {
		const {
			paymentIntentId,
			currency,
			productId,
			pickUp,
			dropOff,
			locationPick,
			locationDrop,
		} = dto
		const paid = await this.stripeService.verifyPaymentIntent(paymentIntentId)
    if (!paid) throw new BadRequestException('Payment not confirmed')

		const product = await this.productService.getById(productId)
		const pickUpDate = new Date(pickUp)
		const dropOffDate = new Date(dropOff)
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

		const totalPrice = this.calculateRentalPrice(pickUpDate, dropOffDate, product.price)

		const order = await this.prismaService.orders.create({
			data: {
				userId,
				productId,
				pickUp: pickUpDate,
				dropOff: dropOffDate,
				locationPick,
				locationDrop,
				price: totalPrice,
				currency,
				paymentIntentId
			},
		})

		return order
	}

	private calculateRentalPrice(
		pickUpDate: Date,
		dropOffDate: Date,
		price: number
	): number {
		const oneDayMs = 24 * 60 * 60 * 1000
		const diffInMs = dropOffDate.getTime() - pickUpDate.getTime()
		const numberOfDays = diffInMs / oneDayMs

		return numberOfDays * price
	}
}
   
import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProductDto } from './dto/product.dto'
import { GoogleCloudService } from 'src/upload-files/google-cloud.service'
import { Orders, Products, Reviews } from 'generated/prisma'

type additionalData = {
	isAvailableNow: boolean
	nextAvailableDate: Date | null
	ratingAvg: number
	reviewsCount: number
	ordersCount: number
}

@Injectable()
export class ProductService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly googleCloudService: GoogleCloudService
	) {}

	async getAll(): Promise<Array<Products & additionalData>> {
		const products = await this.prismaService.products.findMany({
			include: {
				discount: true,
				reviews: { select: { rating: true } },
				orders: { select: { pickUp: true, dropOff: true } },
			},
		})

		const now = new Date()

		return products.map((product) => {
			const { ratingAvg, ratings } = this.rating(product.reviews)
			const { isAvailableNow, nextAvailableDate } = this.availableDates(
				product.orders,
				product.quantity,
				now
			)
			return {
				...product,
				isAvailableNow,
				nextAvailableDate,
				ratingAvg,
				reviewsCount: ratings.length,
				ordersCount: product.orders.length,
			}
		})
	}

	async getById(id: string): Promise<Products> {
		const product = await this.prismaService.products.findUnique({
			where: { id },
			include: { orders: true, reviews: true },
		})

		if (!product) throw new NotFoundException(`Product not found`)

		return product
	}

	async create(data: ProductDto, urls: string[]): Promise<Products> {
		try {
			const newProduct = await this.prismaService.products.create({
				data: {
					...data,
					gasoline: Number(data.gasoline),
					price: Number(data.price),
					icons: urls,
					quantity: Number(data.quantity) || 1,
				},
			})
			return newProduct
		} catch (error) {
			await this.googleCloudService.deleteFiles(urls)
			throw new InternalServerErrorException('Failed to create product')
		}
	}

	async deleteAll(): Promise<{ message: string }> {
		const products = await this.prismaService.products.findMany({
			select: { icons: true },
		})

		if (products.length === 0)
			throw new NotFoundException('No products found to delete')

		const allIcons = products.flatMap((item) => item.icons)

		await this.prismaService.products.deleteMany()
		await this.googleCloudService.deleteFiles(allIcons).catch(() => {
			throw new InternalServerErrorException('Failed to delete icons')
		})

		return { message: 'Products were deleted successfully' }
	}

	async deleteById(id: string): Promise<{ message: string }> {
		const product = await this.getById(id)

		await this.prismaService.products.delete({ where: { id } })

		await this.googleCloudService.deleteFiles(product.icons).catch(() => {
			throw new InternalServerErrorException('Failed to delete icon')
		})

		return { message: `Product deleted successfully` }
	}

	private rating(reviews: Pick<Reviews, 'rating'>[]) {
		const ratings = reviews.map((r) => r.rating)

		const ratingAvg =
			ratings.length > 0
				? Math.round(
						(ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10
					) / 10
				: 0

		return { ratings, ratingAvg }
	}

	private availableDates(
		orders: Pick<Orders, 'pickUp' | 'dropOff'>[],
		quantity: number,
		now: Date
	) {
		const activeOrders = orders.filter(
			(order) => order.pickUp <= now && order.dropOff >= now
		)

		const isAvailableNow = activeOrders.length < quantity

		const futureDropDates = orders
			.filter((order) => order.dropOff > now)
			.map((order) => order.dropOff)
			.sort((a, b) => a.getTime() - b.getTime())

		const nextAvailableDate = isAvailableNow
			? now
			: futureDropDates[quantity - 1] || null

		return { isAvailableNow, nextAvailableDate }
	}
}

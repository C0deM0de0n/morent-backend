import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Review } from 'generated/prisma'
import { PrismaService } from 'src/libs/prisma/prisma.service'
import { ProductService } from 'src/product/product.service'
import { CreateReviewsDto, UpdateReviewsDto } from './dto/reviews.dto'

@Injectable()
export class ReviewsService {
	constructor(
		private prismaService: PrismaService,
		private productService: ProductService
	) {}

	async getReviewsProduct(productId: string): Promise<Review[]> {
		return this.prismaService.review.findMany({
			where: { productId },
			include: { user: true },
		})
	}

	async getById(userId: string, productId: string): Promise<Review> {
		const { id } = await this.productService.getById(productId)

		const key = { userId, productId: id }
		const existingReview = await this.prismaService.review.findUnique({
			where: { userId_productId: key },
			include: { user: true },
		})

		if (!existingReview) throw new NotFoundException('Review not found')

		return existingReview
	}

	async create(userId: string, dto: CreateReviewsDto): Promise<Review> {
		const { id } = await this.productService.getById(dto.productId)

		const key = { userId, productId: id }

		const existingReview = await this.prismaService.review.findUnique({
			where: { userId_productId: key },
			include: { user: true },
		})

		if (existingReview) throw new ConflictException('Review already exist')

		return this.prismaService.review.create({
			data: {
				...dto,
				userId,
			},
		})
	}

	async update(userId: string, dto: UpdateReviewsDto): Promise<Review> {
		const { productId, ...data } = dto
		const { id } = await this.productService.getById(dto.productId)
		const key = { userId, productId: id }

		const existingReview = await this.prismaService.review.findUnique({
			where: { userId_productId: key },
			include: { user: true },
		})
		if (!existingReview) throw new NotFoundException('Review not found')

		return this.prismaService.review.update({
			where: { userId_productId: key },
			data: data,
		})
	}

	async delete(
		userId: string,
		productId: string
	): Promise<{ message: string }> {
		const key = { userId, productId }
		const existingReview = await this.getById(userId, productId)
		if (!existingReview) throw new NotFoundException('Review not found')

		await this.prismaService.review.delete({
			where: { userId_productId: key },
		})

		return { message: 'Review deleted successfully' }
	}

	async deleteAll(userId: string): Promise<{ message: string }> {
		const existingReviews = await this.prismaService.review.findMany({
			where: { userId },
		})

		if (existingReviews.length === 0)
			throw new NotFoundException('No reviews found to delete')

		await this.prismaService.review.deleteMany()

		return { message: 'Reviews deleted successfully' }
	}
}

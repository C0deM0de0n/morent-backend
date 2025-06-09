import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateReviewsDto } from './dto/reviews.dto'
import { UpdateReviewsDto } from './dto/reviews.dto'
import { Reviews } from 'generated/prisma'

@Injectable()
export class ReviewsService {
	constructor(private prismaService: PrismaService) {}

	async getReviewsProduct(productId: string): Promise<Reviews[]> {
		return this.prismaService.reviews.findMany({
			where: { productId },
			include: { user: true },
		})
	}

	async getById(userId: string, productId: string): Promise<Reviews> {
		const key = { userId, productId }
		const existingReview = await this.prismaService.reviews.findUnique({
			where: { userId_productId: key },
			include: { user: true },
		})

		if (!existingReview) throw new NotFoundException('Review not found')

		return existingReview
	}

	async create(userId: string, dto: CreateReviewsDto): Promise<Reviews> {
		const key = { userId, productId: dto.productId }
		const existingReview = await this.prismaService.reviews.findUnique({
			where: { userId_productId: key },
			include: { user: true },
		})

		if (existingReview) throw new ConflictException('Review already exist')

		return this.prismaService.reviews.create({
			data: {
				...dto,
				userId,
			},
		})
	}

	async update(userId: string, dto: UpdateReviewsDto): Promise<Reviews> {
		const { productId, ...data } = dto
		const key = { userId, productId: dto.productId }
		const existingReview = await this.prismaService.reviews.findUnique({
			where: { userId_productId: key },
			include: { user: true },
		})
		if (!existingReview) throw new NotFoundException('Review not found')

		return this.prismaService.reviews.update({
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

		await this.prismaService.reviews.delete({
			where: { userId_productId: key },
		})

		return { message: 'Review deleted successfully' }
	}

	async deleteAll(userId: string): Promise<{ message: string }> {
		const existingReviews = await this.prismaService.reviews.findMany({
			where: { userId },
		})

		if (existingReviews.length === 0)
			throw new NotFoundException('No reviews found to delete')

		await this.prismaService.reviews.deleteMany()

		return { message: 'Reviews deleted successfully' }
	}
}

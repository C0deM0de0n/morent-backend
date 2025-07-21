import { Injectable, NotFoundException } from '@nestjs/common'
import { Favorite } from 'generated/prisma'
import { PrismaService } from 'src/libs/prisma/prisma.service'
import { ProductService } from 'src/product/product.service'

@Injectable()
export class FavoritesService {
	public constructor(
		private prismaService: PrismaService,
		private productService: ProductService
	) {}

	public async getFavorites(
		userId: string
	): Promise<Favorite[]> {
		return this.prismaService.favorite.findMany({ 
			where: { 
				userId 
			} 
		})
	}

	public async getFavorite(
		userId: string,
		productId: string
	): Promise<Favorite | null> {
		const { id } = await this.productService.getById(productId)

		const key = { userId, productId: id }

		return this.prismaService.favorite.findUnique({
			where: { 
				userId_productId: key 
			},
		})
	}

	public async addToFavorites(
		userId: string,
		productId: string
	): Promise<{ message: string }> {
		const favorite = await this.getFavorite(userId, productId)

		if (!favorite) {
			await this.prismaService.favorite.create({
				data: { 
					userId: userId, 
					productId 
				},
			})
			return { message: 'Added to favorites' }
		} else {
			const key = { userId: userId, productId }
			await this.prismaService.favorite.delete({
				where: { 
					userId_productId: key 
				},
			})
			return { message: 'Removed from favorites' }
		}
	}

	public async clearFavorites(
		userId: string
	): Promise<{ message: string }> {
		const favorites = await this.getFavorites(userId)

		if (favorites.length === 0)
			throw new NotFoundException('No favorites found to delete')

		await this.prismaService.favorite.deleteMany({ 
			where: { 
				userId 
			} 
		})

		return { message: 'Favorites cleared successfully' }
	}
}

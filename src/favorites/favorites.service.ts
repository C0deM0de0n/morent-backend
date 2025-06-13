import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { Favorites } from 'generated/prisma'
import { ProductService } from 'src/product/product.service'

@Injectable()
export class FavoritesService {
	constructor(
		private prismaService: PrismaService,
		private productService: ProductService
	) {}

	async getFavorites(userId: string): Promise<Favorites[]> {
		return this.prismaService.favorites.findMany({ where: { userId } })
	} 

	async getFavorite(userId: string, productId: string): Promise<Favorites | null> {
		const { id } = await this.productService.getById(productId)

		const key = { userId, productId: id }

		return this.prismaService.favorites.findUnique({
			where: { userId_productId: key },
		})

	}

	async addToFavorites(userId: string, productId: string): Promise<{ message: string }> {
		const favorite = await this.getFavorite(userId, productId)

		if(!favorite) {
			await this.prismaService.favorites.create({
				data: { userId: userId, productId }
			})
			return { message: 'Added to favorites' };
		} else {
			const key = { userId: userId, productId }
			await this.prismaService.favorites.delete({ where: { userId_productId: key } })
			return { message: 'Removed from favorites' }
		}
	}

	async clearFavorites(userId: string): Promise<{ message: string }> {
		const favorites = await this.getFavorites(userId)

		if(favorites.length === 0) 
			throw new NotFoundException('No favorites found to delete')
		
		await this.prismaService.favorites.deleteMany({ where: { userId } })

		return { message: 'Favorites cleared successfully' }
	}
}

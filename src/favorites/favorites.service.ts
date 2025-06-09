import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { Favorites, FavoritesItem, Products } from 'generated/prisma'

@Injectable()
export class FavoritesService {
	constructor(private prismaService: PrismaService) {}

	async getFavorites(
		userId: string
	): Promise<(Favorites & { favoritesItem: (FavoritesItem & { product: Products })[] })> {
		let favorites = await this.prismaService.favorites.findUnique({
			where: { userId },
			include: {
				favoritesItem: {
					include: { product: true },
				},
			},
		})
		if (!favorites) {
			favorites = await this.prismaService.favorites.create({
				data: { userId },
				include: {
					favoritesItem: {
						include: { product: true },
					},
				},
			})
		}
		return favorites
	}

	async getFavoriteItem(
		favoritesId: string,
		productId: string
	): Promise<FavoritesItem | null> {
		const key = { favoritesId, productId }
		const existingItem = await this.prismaService.favoritesItem.findUnique({
			where: { favoritesId_productId: key },
		})

		return existingItem
	}

	async addToFavorite(userId: string, productId: string): Promise<{ message: string }> {
		const favorites = await this.getFavorites(userId)
		const favoriteItem = await this.getFavoriteItem(favorites.id, productId)

		const key = { favoritesId: favorites.id, productId }

		if(!favoriteItem) {
			await this.prismaService.favoritesItem.create({
				data: { favoritesId: favorites.id, productId }
			})
			return { message: 'Added to favorites' };
		} else {
			await this.prismaService.favoritesItem.delete({ where: { favoritesId_productId: key } })
			return { message: 'Removed from favorites' }
		}
	}

	async clearFavorites(userId: string): Promise<{ message: string }> {
		const favorites = await this.getFavorites(userId)

		await this.prismaService.favoritesItem.deleteMany({
			where: { favoritesId: favorites.id },
		})

		return { message: 'Favorites cleared successfully' }
	}
}

import { 
	Controller, 
	Delete, 
	Get, 
	HttpCode,
	Param, 
	Post 
} from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { Authorization } from 'src/decorators/auth.decorator'
import { Authorized } from 'src/decorators/authorized.decorator'
import { Favorite } from 'generated/prisma'

@Controller('favorites')
export class FavoritesController {
	public constructor(
		private readonly favoritesService: FavoritesService
	) {}

	@Get('get-all')
	@Authorization('USER')
	@HttpCode(200)
	public async getFavorites(
		@Authorized('id') userId: string
	): Promise<Favorite[]> {
		return this.favoritesService.getFavorites(userId)
	}

	@Post('add-remove/:id')
	@Authorization('USER')
	@HttpCode(200)
	public async addToFavorite(
		@Authorized('id') userId: string,
		@Param('id') productId: string
	): Promise<{ message: string }> {
		return this.favoritesService.addToFavorites(userId, productId)
	}

	@Delete('clear')
	@Authorization('USER')
	@HttpCode(200)
	public async clearFavorites(
		@Authorized('id') userId: string
	): Promise<{ message: string }> {
		return this.favoritesService.clearFavorites(userId)
	}
}

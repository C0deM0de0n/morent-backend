import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { Auth } from 'src/decorator/auth.decorator'
import { CurrentUser } from 'src/decorator/user.decorator'

@Controller('favorites')
export class FavoritesController {
	constructor(private readonly favoritesService: FavoritesService) {}

	@Get('')
	@Auth()
	@HttpCode(200)
	getFavorites(@CurrentUser('id') userId: string) {
		return this.favoritesService.getFavorites(userId)
	}

	@Post('add-remove/:id')
	@Auth()
	@HttpCode(200)
	addToFavorite(
		@CurrentUser('id') userId: string,
		@Param('id') productId: string
	) {
		return this.favoritesService.addToFavorite(userId, productId)
	}

	@Delete('clear')
	@Auth()
	@HttpCode(200)
	clearFavorites(@CurrentUser('id') userId: string) {
		return this.favoritesService.clearFavorites(userId)
	}
}

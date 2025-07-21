import { Module } from '@nestjs/common'
import { ProductModule } from 'src/product/product.module'
import { FavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'

@Module({
	imports: [ProductModule],
	controllers: [FavoritesController],
	providers: [FavoritesService],
})
export class FavoritesModule {}

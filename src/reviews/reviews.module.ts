import { Module } from '@nestjs/common'
import { ProductModule } from 'src/product/product.module'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'

@Module({
	imports: [ProductModule],
	controllers: [ReviewsController],
	providers: [ReviewsService],
})
export class ReviewsModule {}

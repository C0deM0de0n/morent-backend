import { Module } from '@nestjs/common'
import { GoogleCloudService } from 'src/libs/upload-files/google-cloud.service'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	controllers: [ProductController],
	providers: [ProductService, GoogleCloudService],
	exports: [ProductService],
})
export class ProductModule {}

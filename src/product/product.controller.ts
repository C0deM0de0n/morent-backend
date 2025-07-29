import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesUpload } from './interceptors/file-upload.interceptor'
import { GoogleCloudService } from './upload-files/google-cloud.service'
import { Authorization } from 'src/decorators/auth.decorator'
import { ProductDto } from './dto/product.dto'
import { ProductService } from './product.service'
import type { Product } from 'generated/prisma'

@Controller('product')
export class ProductController {
	public constructor(
		private readonly productService: ProductService,
		private readonly googleCloudService: GoogleCloudService
	) {}

	@Get('get-all')
	@HttpCode(200)
	public async getAll(): Promise<Product[]> {
		return this.productService.getAll()
	}

	@Get('get/:id')
	@HttpCode(200)
	public async getById(
		@Param('id') id: string
	): Promise<Product> {
		return this.productService.getById(id)
	}

	@Post('create')
	// @Authorization('ADMIN')
	@UseInterceptors(FilesUpload.files())
	@HttpCode(200)
	public async create(
		@Body() data: ProductDto,
		@UploadedFiles() files: {
			mainIcon: Express.Multer.File[],
			galleryIcons: Express.Multer.File[]
		}
	): Promise<Product> {
		const mainIcon = await this.googleCloudService.uploadFiles(files.mainIcon)
		const galleryIcons = await this.googleCloudService.uploadFiles(files.galleryIcons)
		return this.productService.create(data, mainIcon, galleryIcons)
	}

	@Delete('delete-all')
	// @Authorization('ADMIN')
	@HttpCode(200)
	async deleteAll(): Promise<{ message: string }> {
		return this.productService.deleteAll()
	}

	@Delete('delete/:id')
	// @Authorization('ADMIN')
	@HttpCode(200)
	async deleteById(
		@Param('id') id: string
	): Promise<{ message: string }> {
		return this.productService.deleteById(id)
	}
}

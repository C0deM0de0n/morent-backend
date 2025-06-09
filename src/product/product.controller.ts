import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { ProductService } from './product.service'
import { Roles } from 'src/decorator/role.decorator'
import { Auth } from 'src/decorator/auth.decorator'
import { ProductDto } from './dto/product.dto'
import { FilesUpload } from 'src/interceptors/file-upload.interceptor'
import { GoogleCloudService } from 'src/upload-files/google-cloud.service'

@Controller('product')
export class ProductController {
	constructor(
    private readonly productService: ProductService,
    private readonly googleCloudService: GoogleCloudService
  ) {}

	@Get('get-all')
	@HttpCode(200)
	async getAll() {
		return this.productService.getAll()
	}

	@Get('get/:id')
	@HttpCode(200)
	async getById(@Param('id') id: string) {
		return this.productService.getById(id)
	}

	@Post('create')
	@Roles(['USER'])
	@Auth()
	@UseInterceptors(FilesUpload.images())
	@HttpCode(200)
	async create(
    @Body() data: ProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const icons = await this.googleCloudService.uploadFiles(files)
		return this.productService.create(data, icons)
	}

	@Delete('delete-all')
	@Roles(['USER'])
	@Auth()
	@HttpCode(200)
	async deleteAll() {
		return this.productService.deleteAll()
	}

	@Delete('delete/:id')
	@Roles(['USER'])
	@Auth()
	@HttpCode(200)
	async deleteById(@Param('id') id: string) {
		return this.productService.deleteById(id)
	}
}

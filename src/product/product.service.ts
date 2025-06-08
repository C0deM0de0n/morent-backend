import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProductDto } from './dto/product.dto'
import { GoogleCloudService } from 'src/upload-files/google-cloud.service'

@Injectable()
export class ProductService {
	constructor(
		private prismaService: PrismaService,
		private googleCloudService: GoogleCloudService
	) {}

	async getAll() {
		return this.prismaService.products.findMany({
			include: { discount: true, reviews: true },
		})
	}

	async getById(id: string) {
		return this.prismaService.products.findUnique({ where: { id } })
	}

	async create(data: ProductDto, urls: string[]) {
		try {
			return this.prismaService.products.create({
				data: {
					...data,
					gasoline: +data.gasoline,
					price: +data.price,
					icons: urls,
				},
			})
		} catch (error) {
			await this.googleCloudService.deleteFiles(urls)
			throw new InternalServerErrorException('Invalid to create a product')
		}
	}

	async deleteAll() {
		try {
			const result = await this.prismaService.products.findMany({
				select: { icons: true },
			})
			const urls = result.flatMap((item) => item.icons)

			await this.prismaService.products.deleteMany()
			await this.googleCloudService.deleteFiles(urls)
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException(
				'Invalid to delete products'
			)
		}
	}
	async deleteById(id: string) {
		return this.prismaService.products.delete({ where: { id } })
	}
}

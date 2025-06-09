import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProductDto } from './dto/product.dto'
import { GoogleCloudService } from 'src/upload-files/google-cloud.service'
import { Products } from 'generated/prisma'

@Injectable()
export class ProductService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly googleCloudService: GoogleCloudService
	) {}

	async getAll(): Promise<Products[]> {
		return await this.prismaService.products.findMany({
			include: { discount: true, reviews: true },
		})
	}

	async getById(id: string): Promise<Products> {
		const product = await this.prismaService.products.findUnique({
				where: { id },
		})

		if (!product) throw new NotFoundException(`Product not found`)

		return product
	}

	async create(data: ProductDto, urls: string[]): Promise<Products> {
		try {
			const newProduct = await this.prismaService.products.create({
				data: {
					...data,
					gasoline: +data.gasoline,
					price: +data.price,
					icons: urls,
				},
			})
			return newProduct
		} catch (error) {
			await this.googleCloudService.deleteFiles(urls)
			throw new InternalServerErrorException('Failed to create product')
		}
	}

	async deleteAll(): Promise<{ message: string }> {
		const products = await this.prismaService.products.findMany({
			select: { icons: true },
		})

		if(products.length === 0) throw new NotFoundException('No products found to delete')

		const allIcons = products.flatMap((item) => item.icons)

		await this.prismaService.products.deleteMany()
		await this.googleCloudService.deleteFiles(allIcons).catch(() => {
			throw new InternalServerErrorException('Failed to delete icons')
		})

		return { message: 'Products were deleted successfully' }
	}

	async deleteById(id: string): Promise<{ message: string }> {
			const product = await this.getById(id)

			await this.prismaService.products.delete({ where: { id } })

			await this.googleCloudService.deleteFiles(product.icons).catch(() => {
				throw new InternalServerErrorException('Failed to delete icon')
			})

			return { message: `Product deleted successfully` }
	}
}

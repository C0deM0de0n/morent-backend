import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Discount, DropOff, Location, Order, PickUp, Product, Review } from 'generated/prisma';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { GoogleCloudService } from 'src/product/upload-files/google-cloud.service';
import { ProductDto } from './dto/product.dto';
import { Prisma } from 'generated/prisma';

type ProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        discount: true,
        location: true,
        orders: true,
        reviews: true
    }
}>

type additionalData = {
    isAvailableNow: boolean;
    nextAvailableDate: Date | null;
    ratingAvg: number;
    reviewsCount: number;
    ordersCount: number;
};

@Injectable()
export class ProductService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly googleCloudService: GoogleCloudService,
    ) {}

    public async getAll(): Promise<Array<Product & additionalData>> {
        const products = await this.prismaService.product.findMany({
            include: {
                discount: true,
                location: true,
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                orders: {
                    where: { deletedAt: null },
                    select: {
                        pickUp: true,
                        dropOff: true,
                    }
                },
            },
        });

        const now = new Date();

        return products.map(product => {
            const { ratingAvg, ratings } = this.rating(product.reviews);
            const { isAvailableNow, nextAvailableDate } = this.availableDates(
                product.orders,
                product.location,
                now,
            );
            return {
                ...product,
                isAvailableNow,
                nextAvailableDate,
                ratingAvg,
                reviewsCount: ratings.length,
                ordersCount: product.orders.length,
            };
        });
    }

    public async getById(
        id: string
    ): Promise<ProductWithRelations> {
        const product = await this.prismaService.product.findUnique({
            where: { id },
            include: {
                discount: true,
                location: true,
                orders: true,
                reviews: true,
            },
        });

        if (!product) throw new NotFoundException(`Product not found`);

        return product;
    }

    public async create(
        dto: ProductDto,
        mainIcon: string[],
        galleryIcons: string[],
    ): Promise<Product> {
        try {
            const newProduct = await this.prismaService.product.create({
                data: {
                    ...dto,
                    mainIcon: mainIcon[0],
                    galleryIcons,
                    gasoline: Number(dto.gasoline),
                    price: Number(dto.price)
                },
            });
            return newProduct;
        } catch (error) {
            console.log(error)
            await this.googleCloudService.deleteFiles([...mainIcon, ...galleryIcons]);
            throw new InternalServerErrorException('Failed to create product');
        }
    }

    public async deleteAll(): Promise<{ message: string }> {
        const products = await this.prismaService.product.findMany({
            select: { mainIcon: true, galleryIcons: true },
        });

        if (products.length === 0) throw new NotFoundException('No products found to delete');

        const allIcons = products.flatMap(item => item.galleryIcons);

        await this.prismaService.product.deleteMany();
        await this.googleCloudService.deleteFiles(allIcons).catch(() => {
            throw new InternalServerErrorException('Failed to delete icons');
        });

        return { message: 'Products were deleted successfully' };
    }

    public async deleteById(id: string): Promise<{ message: string }> {
        const product = await this.getById(id);

        await this.prismaService.product.delete({ where: { id } });

        await this.googleCloudService
            .deleteFiles([product.mainIcon, ...product.galleryIcons])
            .catch(error => {
                throw new InternalServerErrorException('Failed to delete icon');
            });

        return { message: `Product deleted successfully` };
    }

    private rating(reviews: Pick<Review, 'rating'>[]): { ratings: number[]; ratingAvg: number } {
        const ratings = reviews.map(r => r.rating);

        const ratingAvg =
            ratings.length > 0
                ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
                : 0;

        return { ratings, ratingAvg };
    }

    private availableDates(
        orders: { pickUp: PickUp[], dropOff: DropOff[] }[],
        location: Location[],
        now: Date,
    ) {
        const quantity = location.reduce((sum, loc) => sum + loc.quantity, 0)
        const activeOrders = orders.reduce((sum, order) => 
            sum + ((order.pickUp.length + order.dropOff.length)/2)
        , 0)

        const isAvailableNow = activeOrders < quantity;

        const futureDropDates = orders
        .flatMap(order => order.dropOff)
        .filter(date => date.dropOff >= now)
        .map(date => date.dropOff)
        .sort((a, b) => a.getTime() - b.getTime())

        const nextAvailableDate = isAvailableNow ? now : futureDropDates[quantity - 1] || null;

        return { isAvailableNow, nextAvailableDate };
    }
}

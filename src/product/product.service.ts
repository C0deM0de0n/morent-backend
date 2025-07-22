import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Order, Product, Review } from 'generated/prisma';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { GoogleCloudService } from 'src/product/upload-files/google-cloud.service';
import { ProductDto } from './dto/product.dto';

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
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                orders: {
                    select: {
                        pickUp: true,
                        dropOff: true,
                    },
                },
            },
        });

        const now = new Date();

        return products.map(product => {
            const { ratingAvg, ratings } = this.rating(product.reviews);
            const { isAvailableNow, nextAvailableDate } = this.availableDates(
                product.orders,
                product.quantity,
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

    public async getById(id: string): Promise<Product> {
        const product = await this.prismaService.product.findUnique({
            where: { id },
            include: {
                orders: true,
                reviews: true,
            },
        });

        if (!product) throw new NotFoundException(`Product not found`);

        return product;
    }

    public async create(data: ProductDto, urls: string[]): Promise<Product> {
        try {
            const newProduct = await this.prismaService.product.create({
                data: {
                    ...data,
                    gasoline: Number(data.gasoline),
                    price: Number(data.price),
                    icon: urls[0],
                    video: urls[1],
                    quantity: Number(data.quantity) || 1,
                },
            });
            return newProduct;
        } catch (error) {
            await this.googleCloudService.deleteFiles(urls);
            throw new InternalServerErrorException('Failed to create product');
        }
    }

    public async deleteAll(): Promise<{ message: string }> {
        const products = await this.prismaService.product.findMany({
            select: { icon: true },
        });

        if (products.length === 0) throw new NotFoundException('No products found to delete');

        const allIcons = products.flatMap(item => item.icon);

        await this.prismaService.product.deleteMany();
        await this.googleCloudService.deleteFiles(allIcons).catch(() => {
            throw new InternalServerErrorException('Failed to delete icons');
        });

        return { message: 'Products were deleted successfully' };
    }

    public async deleteById(id: string): Promise<{ message: string }> {
        const product = await this.getById(id);

        await this.prismaService.product.delete({ where: { id } });

        await this.googleCloudService.deleteFiles([product.icon, product.video]).catch(() => {
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
        orders: Pick<Order, 'pickUp' | 'dropOff'>[],
        quantity: number,
        now: Date,
    ) {
        const activeOrders = orders.filter(order => order.pickUp <= now && order.dropOff >= now);

        const isAvailableNow = activeOrders.length < quantity;

        const futureDropDates = orders
            .filter(order => order.dropOff > now)
            .map(order => order.dropOff)
            .sort((a, b) => a.getTime() - b.getTime());

        const nextAvailableDate = isAvailableNow ? now : futureDropDates[quantity - 1] || null;

        return { isAvailableNow, nextAvailableDate };
    }
}

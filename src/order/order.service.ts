import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { StripeService } from 'src/libs/stripe/stripe.service';
import { ProductService } from 'src/product/product.service';
import { LocationService } from 'src/location/location.service';
import { ConfirmOrderDto, CreateOrderDto } from './dto/order.dto';
import type { Order } from 'generated/prisma';
import type { IPaymentIntent } from './types/payment.types';

@Injectable()
export class OrderService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly productService: ProductService,
        private readonly locationService: LocationService,
        private readonly stripeService: StripeService,
    ) {}

    public async getOrders(userId: string): Promise<Order[]> {
        return this.prismaService.order.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            include: {
                product: true,
            },
        });
    }

    public async createPaymentIntent(dto: CreateOrderDto): Promise<IPaymentIntent> {
        const { productId, pickUp, dropOff, currency } = dto;
        const product = await this.productService.getById(productId);

        const pickUpDate = new Date(pickUp);
        const dropOffDate = new Date(dropOff);

        const amount = this.calculateRentalPrice(pickUpDate, dropOffDate, product.price) * 100;

        const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency);

        return paymentIntent;
    }

    public async createOrder(
			userId: string,
			 dto: ConfirmOrderDto
			): Promise<Order> {
        // const paid = await this.stripeService
        // .verifyPaymentIntent(paymentIntentId)

        // if (!paid) throw new BadRequestException('Payment not confirmed')
        const product = await this.productService.getById(dto.productId);

        const locations = await this.locationService.availableLocations(
            dto.locationPickUpId,
            dto.locationDropOffId,
            dto.pickUp,
            dto.dropOff,
        );

        const totalPrice = this.calculateRentalPrice(
            locations.pickUpDate, 
            locations.dropOffDate, 
            product.price
        );

        const pickUpLocation = await this.prismaService.pickUp.create({
            data: {
                pickUp: locations.pickUpDate,
                locationId: dto.locationPickUpId
            }
        })

        const dropOffLocation = await this.prismaService.dropOff.create({
            data: {
                dropOff: locations.dropOffDate,
                locationId: dto.locationDropOffId
            }
        })

        const order = await this.prismaService.order.create({
            data: {
                userId,
                productId: dto.productId,
                price: totalPrice,
                currency: dto.currency,
                paymentIntentId: dto.paymentIntentId,
                pickUpId: pickUpLocation.id,
                dropOffId: dropOffLocation.id
            },
        });

        return order;
    }

    private calculateRentalPrice(pickUpDate: Date, dropOffDate: Date, price: number): number {
        const oneDayMs = 24 * 60 * 60 * 1000;
        const diffInMs = dropOffDate.getTime() - pickUpDate.getTime();
        const numberOfDays = diffInMs / oneDayMs;

        return numberOfDays * price;
    }
}

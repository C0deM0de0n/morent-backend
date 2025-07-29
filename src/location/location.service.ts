import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { ProductService } from 'src/product/product.service';
import { LocationDto, LocationIdDto } from './dto/location.dto';
import type { DropOff, Location, Order, PickUp } from 'generated/prisma';

@Injectable()
export class LocationService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly productService: ProductService,
    ) {}

    public async getLocations(): Promise<Location[]> {
        return this.prismaService.location.findMany();
    }

    public async getLocationsOfProduct(productId: string): Promise<Location[]> {
        await this.productService.getById(productId);

        const locations = await this.prismaService.location.findMany({
            where: { productId },
        });

        return locations;
    }

    public async createLocationsOfProduct(dto: LocationDto, productId: string): Promise<Location> {
        return this.prismaService.location.create({
            data: {
                ...dto,
                quantity: Number(dto.quantity) || 1,
                productId,
            },
        });
    }

    public async deleteLocationsOfProduct(productId: string): Promise<{ message: string }> {
        await this.productService.getById(productId);

        await this.prismaService.location.deleteMany({
            where: {
                productId,
            },
        });

        return { message: 'Locations successfully deleted' };
    }

    public async deleteLocationOfProduct(
        productId: string,
        dto: LocationIdDto,
    ): Promise<{ message: string }> {
        await this.productService.getById(productId);

        await this.prismaService.location.delete({
            where: {
                id: dto.locationId,
                productId,
            },
        });

        return { message: 'Location successfully deleted' };
    }

    public async availableLocations(
        locationPickUpId: string,
        locationDropOffId: string,
        pickUp: string,
        dropOff: string,
    ): Promise<{
        pickUpDate: Date;
        dropOffDate: Date;
    }> {
        const pickUpDate = new Date(pickUp);
        const dropOffDate = new Date(dropOff);

        const locationsPickUp = await this.prismaService.location.findUnique({
            where: { id: locationPickUpId },
            select: { dropOff: true, quantity: true },
        });

        const locationsDropOff = await this.prismaService.location.findUnique({
            where: { id: locationDropOffId },
            select: { dropOff: true, quantity: true },
        });

        if (!locationsPickUp || !locationsDropOff) {
            throw new BadRequestException('One or both locations not found');
        }

        if(locationsPickUp.dropOff.length === locationsPickUp.quantity) {
            throw new BadRequestException('No more car in this location')
        }

        if(locationsDropOff.dropOff.length === locationsDropOff.quantity) {
            throw new BadRequestException('No more car in this location')
        }

        return { pickUpDate, dropOffDate };
    }
}

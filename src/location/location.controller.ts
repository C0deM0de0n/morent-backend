import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { LocationService } from './location.service';
import { Authorization } from 'src/decorators/auth.decorator'
import { LocationDto, LocationIdDto } from './dto/location.dto';
import type { Location } from 'generated/prisma';

@Controller('location')
export class LocationController {
  public constructor(private readonly locationService: LocationService) {}

  @Get('get-all')
  @HttpCode(200)
  public async getLocations(): Promise<Location[]> {
    return this.locationService.getLocations()
  }

  @Get('get-all/:id')
  @HttpCode(200)
  public async getLocationsOfProduct(
    @Param('id') productId: string
  ): Promise<Location[]> {
    return this.locationService.getLocationsOfProduct(productId)
  }

  @Post('create/:id')
  // @Authorization('ADMIN')
  @HttpCode(200)
  public async createLocationOfProduct(
    @Param('id') productId: string,
    @Body() dto: LocationDto
  ): Promise<Location> {
    return this.locationService.createLocationsOfProduct(dto, productId)
  }

  @Delete('delete-all/:id')
  // @Authorization('ADMIN')
  @HttpCode(200)
  public async deleteLocationsOfProduct(
    @Param('id') productId: string
  ): Promise<{ message: string }> {
    return this.locationService.deleteLocationsOfProduct(productId)
  }

  @Delete('delete/:id')
  // @Authorization('ADMIN')
  @HttpCode(200)
  public async deleteLocationOfProduct(
    @Param('id') productId: string,
    @Body() dto: LocationIdDto
  ): Promise<{ message: string }> {
    return this.locationService.deleteLocationOfProduct(productId, dto)
  }
}

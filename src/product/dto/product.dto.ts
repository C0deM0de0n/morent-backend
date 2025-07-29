import {IsString, IsNotEmpty, IsEnum, IsOptional, } from 'class-validator'
import { CarType, Transmission, CarSteering, Capacity} from 'generated/prisma'

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsEnum(CarType)
  type: CarType

  @IsEnum(Transmission)
  transmission: Transmission

  @IsEnum(CarSteering)
  steering: CarSteering

	@IsEnum(Capacity)
	capacity: Capacity

  @IsString()
  gasoline: string

  @IsString()
  price: string
}
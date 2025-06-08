import {IsString, IsNotEmpty, IsArray, IsNumber, IsEnum, } from 'class-validator'
import { CarType, CarSteering, Capacity } from 'generated/prisma'

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsEnum(CarType)
  type: CarType

  @IsEnum(CarSteering)
  steering: CarSteering

	@IsEnum(Capacity)
	capacity: Capacity

  @IsString()
  gasoline: string

  @IsString()
  price: string
}
import { IsDateString, IsString } from 'class-validator'

export class CreateOrderDto {
  @IsString()
  productId: string

  @IsDateString()
  pickUp: string

  @IsDateString()
  dropOff: string

  @IsString()
  locationPick: string

  @IsString()
  locationDrop: string
}

import { IsDateString, IsString, Validate } from 'class-validator'
import { FullDayRangeValidator } from './fullDateRangeValidator'

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

  @Validate(FullDayRangeValidator)
  dateRange: any

  @IsString()
  currency: string
}

export class ConfirmOrderDto extends CreateOrderDto {
  @IsString()
  paymentIntentId: string
}

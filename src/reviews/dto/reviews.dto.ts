import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator'

export class CreateReviewsDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number

  @IsString()
  @Length(1, 500) 
  comment: string

  @IsString()
  productId: string
}

export class UpdateReviewsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number

  @IsString()
  @IsOptional()
  @Length(1, 500) 
  comment?: string

  @IsString()
  productId: string
}
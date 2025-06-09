import { IsString, IsInt, Min } from 'class-validator';

export class CartItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

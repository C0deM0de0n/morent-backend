import { IsString, IsNotEmpty, Length, Matches, IsUUID, IsOptional } from 'class-validator';

export class LocationDto {
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @Length(2, 100, { message: 'City must be between 2 and 50 characters' })
  @Matches(/^[\p{L}\s\-]+$/u, {
    message: 'City contains invalid characters',
  })
  city: string;

  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  @Matches(/^[\p{L}\d\s\-.,]+$/u, {
    message: 'Address contains invalid characters',
  })
  address: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'quantity must contain only numbers' })
  quantity?: string;
}

export class LocationIdDto {
  @IsUUID('4', { message: 'location must be a valid uuid' })
  locationId: string
}

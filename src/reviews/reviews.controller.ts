import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  HttpCode, 
  Param, 
  Patch, 
  Post, 
} from '@nestjs/common';
import { Authorization } from 'src/decorators/auth.decorator'
import { Authorized } from 'src/decorators/authorized.decorator'
import { ReviewsService } from './reviews.service';
import { 
  CreateReviewsDto, 
  UpdateReviewsDto 
} from './dto/reviews.dto';
import type { Review } from 'generated/prisma'

@Controller('reviews')
export class ReviewsController {
  public constructor(
    private readonly reviewsService: ReviewsService
  ) {}

  @Get('other/:id')
  @HttpCode(200)
  public async getAll(
    @Param('id') productId: string
  ): Promise<Review[]> {
    return this.reviewsService.getReviewsProduct(productId)
  } 

  @Get('my/:id')
	@Authorization('USER')
  @HttpCode(200)
  public async getById(
    @Authorized('id') userId: string, 
    @Param('id') productId: string
  ): Promise<Review> {
    return this.reviewsService.getById(userId, productId)
  } 

  @Post('create')
	@Authorization('USER')
  @HttpCode(200)
  public async create(
    @Authorized('id') userId: string, 
    @Body() dto: CreateReviewsDto
  ): Promise<Review> {
    return this.reviewsService.create(userId, dto)
  }

  @Patch('update')
  @Authorization('USER')
  @HttpCode(200)
  public async update(
    @Authorized('id') userId: string, 
    @Body() dto: UpdateReviewsDto
  ): Promise<Review> {
    return this.reviewsService.update(userId, dto)
  }

  @Delete('delete/:id')
	@Authorization('USER')
  @HttpCode(200)
  public async delete(
    @Authorized('id') userId: string, 
    @Param('id') productId: string
  ): Promise<{ message: string }> {
    return this.reviewsService.delete(userId, productId)
  }

  @Delete('delete')
  @Authorization('USER')
  @HttpCode(200)
  public async deleteAll(
    @Authorized('id') userId: string
  ): Promise<{ message: string }> {
    return this.reviewsService.deleteAll(userId)
  }
}

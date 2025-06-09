import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Auth } from 'src/decorator/auth.decorator'
import { CurrentUser } from 'src/decorator/user.decorator'
import { CreateReviewsDto, UpdateReviewsDto } from './dto/reviews.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('other/:id')
  @HttpCode(200)
  async getAll(@Param('id') productId: string) {
    return this.reviewsService.getReviewsProduct(productId)
  } 

  @Get('my/:id')
  @Auth()
  @HttpCode(200)
  async getById(@CurrentUser('id') userId: string, @Param('id') productId: string) {
    return this.reviewsService.getById(userId, productId)
  } 

  @Post('create')
  @Auth()
  @HttpCode(200)
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewsDto) {
    return this.reviewsService.create(userId, dto)
  }

  @Patch('update')
  @Auth()
  @HttpCode(200)
  async update(@CurrentUser('id') userId: string, @Body() dto: UpdateReviewsDto) {
    return this.reviewsService.update(userId, dto)
  }

  @Delete('delete/:id')
  @Auth()
  @HttpCode(200)
  async delete(@CurrentUser('id') userId: string, @Param('id') productId: string) {
    return this.reviewsService.delete(userId, productId)
  }

  @Delete('delete')
  @Auth()
  @HttpCode(200)
  async deleteAll(@CurrentUser('id') userId: string) {
    return this.reviewsService.deleteAll(userId)
  }
}

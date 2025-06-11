import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from 'src/decorator/auth.decorator';
import { CurrentUser } from 'src/decorator/user.decorator';
import { CreateOrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Auth()
  @HttpCode(200)
  async getOrders(@CurrentUser('id') userId: string) {
    return this.orderService.getOrders(userId)
  }

  @Post('create')
  @Auth()
  @HttpCode(200)
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId, dto)
  }
}

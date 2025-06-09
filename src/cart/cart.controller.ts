import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
} from '@nestjs/common'
import { CartService } from './cart.service'
import { CurrentUser } from 'src/decorator/user.decorator'
import { Auth } from 'src/decorator/auth.decorator'
import { CartItemDto } from './dto/cartItem.dto'

@Controller('cart')
export class CartController {
	constructor(private readonly cartService: CartService) {}

	@Get('')
	@Auth()
	@HttpCode(200)
	getCart(@CurrentUser('id') userId: string) {
		return this.cartService.getCart(userId)
	}

	@Post('add-item')
	@Auth()
	@HttpCode(200)
	addItem(@CurrentUser('id') userId: string, @Body() dto: CartItemDto) {
		return this.cartService.addItem(userId, dto)
	}

	@Delete('delete-item/:id')
	@Auth()
	@HttpCode(200)
	removeItem(@CurrentUser('id') userId: string, @Param('id') productId: string) {
		return this.cartService.removeItem(userId, productId)
	}

	@Delete('clear')
	@Auth()
  @HttpCode(200)
	clearCart(@CurrentUser('id') userId: string) {
		return this.cartService.clearCart(userId)
	}
}

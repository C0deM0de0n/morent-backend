import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CartItemDto } from './dto/cartItem.dto'
import { Cart, CartItems } from 'generated/prisma'

@Injectable()
export class CartService {
	constructor(private prismaService: PrismaService) {}

	async getCart(userId: string): Promise<Cart | null> {
		return this.prismaService.cart.findUnique({
			where: { userId },
			include: {
				cartItems: {
					include: { product: true },
				},
			},
		})
	}

	async getCartItem(id: string, productId: string): Promise<CartItems> {
		const key = { cartId: id, productId }
		const existingItem = await this.prismaService.cartItems.findUnique({
			where: { cartId_productId: key },
		})

		if (!existingItem) throw new NotFoundException('Cart item not found')

		return existingItem
	}

	async addItem(userId: string, dto: CartItemDto) {
		let cart = await this.getCart(userId)

		if (!cart) {
			cart = await this.prismaService.cart.create({
				data: { userId },
				include: {
					cartItems: {
						include: { product: true },
					},
				},
			})
		}

		return this.prismaService.cartItems.upsert({
			where: {
				cartId_productId: {
					cartId: cart.id,
					productId: dto.productId,
				},
			},
			update: {
				quantity: { increment: dto.quantity },
			},
			create: {
				cartId: cart.id,
				productId: dto.productId,
				quantity: dto.quantity,
			},
		})
	}

	async removeItem(userId: string, productId: string): Promise<CartItems> {
		const cart = await this.getCart(userId)

		if (!cart) throw new NotFoundException('Cart not found')

		const key = { cartId: cart.id, productId }
		const cartItem = await this.getCartItem(cart.id, productId)
		
		return cartItem.quantity === 1
			? this.prismaService.cartItems.delete({ where: { cartId_productId: key } })
			: this.prismaService.cartItems.update({
				where: { cartId_productId: key },
				data: { quantity: { decrement: 1 } }
			})
	}

	async clearCart(userId: string): Promise<{ message: string }> {
		const cart = await this.getCart(userId)
		if (!cart) throw new NotFoundException('Cart not found')

		await this.prismaService.cartItems.deleteMany({
			where: { cartId: cart.id },
		})

		return { message: 'Cart cleared successfully' }
	}
}

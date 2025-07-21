import Stripe from 'stripe'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class StripeService {
	private stripe: Stripe
	constructor(
		private configService: ConfigService,
	) {
		const secret = configService.get<string>('STRIPE_SECRET') as string
		this.stripe = new Stripe(secret, { apiVersion: '2025-05-28.basil' })
	}

  async createPaymentIntent(amount: number, currency: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount, 
      currency,
      automatic_payment_methods: { enabled: true }, 
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  }

  async verifyPaymentIntent(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent.status === 'succeeded'
  }
}

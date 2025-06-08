import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from 'src/user/user.service'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { Twilio } from 'twilio'
import { SendMobileVerify, VerifyMobileCode } from './dto/auth.dto'
import { Response } from 'express'
import type { Users } from 'generated/prisma'

@Injectable()
export class AuthService {
	private twilioClient: Twilio
	private readonly CODE_TTL = 300

	constructor(
		@InjectRedis() private readonly redis: Redis,
		private configService: ConfigService,
		private userService: UserService,
		private jwtService: JwtService
	) {
		const accountSid = configService.get<string>('TWILIO_ACCOUNT_SID')
		const authToken = configService.get<string>('TWILIO_AUTH_TOKEN')
		this.twilioClient = new Twilio(accountSid, authToken)
	}

	async sendMobileVerify(data: SendMobileVerify): Promise<void> {
		const spamKey = `auth:spam:${data.mobile}`
		const isSpamming = await this.redis.get(spamKey)
		if (isSpamming) throw new BadRequestException('Too many requests. Try again later')

		const code = this.generateCode()
		await this.redis.set(`auth:${data.mobile}`, code, 'EX', this.CODE_TTL)
		await this.redis.set(spamKey, '1', 'EX', 30);

		await this.twilioClient.messages.create({
			body: `Your verification code is: ${code}`,
			from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
			to: data.mobile,
		})
	}

	async verifyMobileCode(data: VerifyMobileCode) {
		const code = await this.redis.get(`auth:${data.mobile}`)
		if (code !== data.code) throw new BadRequestException('Invalid code')

		let user = await this.userService.gteByMobile(data.mobile)
		if (!user) user = await this.userService.create({ mobile: data.mobile })
		await this.redis.del(`auth:${data.mobile}`)

		const tokens = this.createTokens(user.id)

		return { user, ...tokens }
	}

	async googleAuth(data: Users) {
		if (!data.email) throw new BadRequestException()

		let user = await this.userService.getByEmail(data.email)
		if (!user) user = await this.userService.create(data)

		const tokens = this.createTokens(user.id)
		return { user, ...tokens }
	}

	private createTokens(id: string) {
		const data = { id }
		const accessToken = this.jwtService.sign(data, {
			expiresIn: '1h',
		})

		const refreshToken = this.jwtService.sign(data, {
			expiresIn: '7d',
		})

		return { accessToken, refreshToken }
	}

	private generateCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	addRefreshTokenToCookies(res: Response, refreshToken: string) {
		const expires = new Date()
		expires.setDate(expires.getDate() + 7)

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			secure: true,
			sameSite: 'strict',
			expires,
		})
	}
}

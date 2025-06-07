import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { PrismaService } from 'src/prisma.service'
import type { User } from 'generated/prisma'
import { Response } from 'express'

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private prismaService: PrismaService
	) {}

	async googleAuth(data: User) {
		if (!data.email) throw new BadRequestException()

		let user = await this.prismaService.user.findUnique({
			where: { email: data.email },
		})

		if(!user) {
			user = await this.prismaService.user.create({
				data: data
			})
		}

		const tokens = this.createTokens(user.id)

		return {
			user,
			...tokens
		}
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

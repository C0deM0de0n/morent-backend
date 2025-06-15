import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common'
import { Google0AuthGuard } from 'src/auth/guard/google.guard'
import { AuthService } from './auth.service'
import { SendMobileVerify, VerifyMobileCode } from './dto/auth.dto'
import type { Users } from 'generated/prisma'
import { Request, Response } from 'express'
import { Auth } from 'src/decorator/auth.decorator'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('send-mobile-verify')
	@HttpCode(200)
	async sendMobileVerify(@Body() data: SendMobileVerify) {
		await this.authService.sendMobileVerify(data)
		return { message: 'Code sent' }
	}

	@Post('verify-mobile-code')
	@HttpCode(200)
	async verifyMobileCode(
		@Body() data: VerifyMobileCode,
		@Res({ passthrough: true }) res: Response
	) {
		const { refreshToken, ...user } = await this.authService.verifyMobileCode(data)
		this.authService.addRefreshTokenToCookies(res, refreshToken)
		return user
	}

	@Get('google')
	@HttpCode(200)
	@UseGuards(Google0AuthGuard)
	async googleAuth() {}

	@Get('google-callback')
	@HttpCode(200)
	@UseGuards(Google0AuthGuard)
	async googleAuthCallBack(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const googleUser = req.user as Users
		if (!googleUser) throw new BadRequestException('Google user not found')

		const { refreshToken, ...user } = await this.authService.googleAuth(googleUser)
		this.authService.addRefreshTokenToCookies(res, refreshToken)
		return user
	}

	@Post('access-token')
	@HttpCode(200)
	async updateTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies = req.cookies['refreshToken']
		if(!refreshTokenFromCookies) {
			this.authService.removeRefreshTokenFromCookies(res)
			throw new UnauthorizedException('Refresh token not passed')
		}

		const { refreshToken, ...user } = await this.authService.updateTokens(refreshTokenFromCookies)

		this.authService.addRefreshTokenToCookies(res, refreshToken)

		return user
	}

	@Post('logout')
	@Auth()
	@HttpCode(200)
	async logout(@Res({ passthrough: true }) res: Response) {
		return this.authService.removeRefreshTokenFromCookies(res)
	}
}

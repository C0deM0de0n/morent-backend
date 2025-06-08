import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { User } from 'generated/prisma'
import { Google0AuthGuard } from 'src/auth/guard/google.guard'
import { AuthService } from './auth.service'
import { SendMobileVerify, VerifyMobileCode } from './dto/auth.dto'

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
		const googleUser = req.user as User
		if (!googleUser) throw new BadRequestException('Google user not found')

		const { refreshToken, ...user } = await this.authService.googleAuth(googleUser)
		this.authService.addRefreshTokenToCookies(res, refreshToken)
		return user
	}
}

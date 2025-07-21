import { 
	Controller, 
	Post, 
	Req,
	Res,
	Body, 
	HttpCode, 
	HttpStatus
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import type { User } from 'generated/prisma'

@Controller('auth')
export class AuthController {
	public constructor(
		private readonly authService: AuthService
	) {}

	@Post('register')
	@HttpCode(HttpStatus.OK)
	public async register(
		@Req() req: Request,
		@Body() dto: RegisterDto
	): Promise<User> {
		return this.authService.register(req, dto)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Req() req: Request,
		@Body() dto: LoginDto
	): Promise<User> {
		return this.authService.login(req, dto)
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		return this.authService.logout(req, res)
	}
}

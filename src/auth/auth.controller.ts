import { 
  BadRequestException,
  Controller,
  Get,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Google0AuthGuard } from 'src/guard/google.guard';
import { Response, Request } from 'express'
import { User } from 'generated/prisma'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(Google0AuthGuard)
  async googleAuth() {}

  @Get('google-callback')
  @UseGuards(Google0AuthGuard)
  async googleAuthCallBack(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const googleUser = req.user as User
    if(!googleUser) throw new BadRequestException('Google user not found')

    const { refreshToken, ...user  } = await this.authService.googleAuth(googleUser)

    this.authService.addRefreshTokenToCookies(res, refreshToken)

    return user
  }
}

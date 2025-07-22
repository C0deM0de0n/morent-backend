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
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Google0AuthGuard } from 'src/auth/guard/google.guard';
import { Authorization } from 'src/decorators/auth.decorator';
import { AuthService } from './auth.service';
import type { User } from 'generated/prisma';
import type { TProviderAuth } from './types/provider-auth';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @HttpCode(200)
    @UseGuards(Google0AuthGuard)
    public async googleAuth() {}

    @Get('google-callback')
    @HttpCode(200)
    @UseGuards(Google0AuthGuard)
    public async googleAuthCallBack(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
        const googleUser = req.user as TProviderAuth;
        if (!googleUser) throw new BadRequestException('Google user not found');

        const { refreshToken, ...user } = await this.authService.googleAuth(googleUser);
        this.authService.addRefreshTokenToCookies(res, refreshToken);
        return user;
    }

    @Post('login')
    @HttpCode(200)
    public async login(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: LoginDto,
    ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
        const { refreshToken, ...user } = await this.authService.login(dto);

        this.authService.addRefreshTokenToCookies(res, refreshToken);

        return user;
    }

    @Post('register')
    @HttpCode(200)
    public async register(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: RegisterDto,
    ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
        const { refreshToken, ...user } = await this.authService.register(dto);

        this.authService.addRefreshTokenToCookies(res, refreshToken);

        return user;
    }

    @Post('access-token')
    @HttpCode(200)
    async updateTokens(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
        const refreshTokenFromCookies = req.signedCookies['refreshToken'];
        if (!refreshTokenFromCookies) {
            this.authService.removeRefreshTokenFromCookies(res);
            throw new UnauthorizedException('Refresh token not passed');
        }

        const { refreshToken, ...user } =
            await this.authService.updateTokens(refreshTokenFromCookies);

        this.authService.addRefreshTokenToCookies(res, refreshToken);

        return user;
    }

    @Post('logout')
    @Authorization()
    @HttpCode(200)
    public async logout(@Res({ passthrough: true }) res: Response) {
        return this.authService.removeRefreshTokenFromCookies(res);
    }
}

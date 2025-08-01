import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { verify } from 'argon2';
import { LoginDto } from './dto/login.dto';
import type { User } from 'generated/prisma';
import type { TProviderAuth } from './types/provider-auth';

type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password'>;
};

@Injectable()
export class AuthService {
    public constructor(
        private configService: ConfigService,
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    public async login(dto: LoginDto): Promise<AuthResponse> {
        const isExist = await this.userService.findByEmail(dto.email);

        if (!isExist) {
            throw new NotFoundException('Invalid Email or Password');
        }

        if (!isExist.password) {
            throw new BadRequestException('Invalid Email or Password');
        }

        const passwordMatches = await verify(isExist.password, dto.password);

        if (!passwordMatches) {
            throw new BadRequestException('Invalid Email or Password');
        }

        const tokens = this.createTokens(isExist.id);
        const { password, ...user } = isExist;

        return { user, ...tokens };
    }

    public async register(dto: RegisterDto): Promise<AuthResponse> {
        const isExist = await this.userService.findByEmail(dto.email);

        if (isExist) {
            throw new ConflictException(
                `This email is already used. Sign in with your password or reset it.`,
            );
        }

        const newUser = await this.userService.createWithCredentials(dto);

        const tokens = this.createTokens(newUser.id);
        const { password, ...user } = newUser;

        return { user, ...tokens };
    }

    public async googleUrl() {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: this.configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
            client_id: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ].join(' '),
        };
        const params = new URLSearchParams(options);
        const url = `${rootUrl}?${params.toString()}`;

        return { url };
    }

    public async googleAuth(data: TProviderAuth): Promise<AuthResponse> {
        if (!data.email) throw new BadRequestException(`Failed to get Email`);

        let user = await this.userService.findByProvider(data.provider, data.providerAccountId);

        if (!user) {
            let unVerifiedUser = await this.userService.findByEmail(data.email);

            if (unVerifiedUser) {
                throw new ConflictException(
                    `This email is already registered. Sign in with your password or reset it.`,
                );
            }

            user = await this.userService.createWithProvider(data);
        }

        const tokens = this.createTokens(user.id);
        return { user, ...tokens };
    }

    public async updateTokens(refreshToken: string): Promise<AuthResponse> {
        const result = await this.jwtService.verifyAsync(refreshToken);
        if (!result) throw new UnauthorizedException('Invalid refresh token');

        const user = await this.userService.findById(result.id);
        const tokens = this.createTokens(user.id);

        return {
            user,
            ...tokens,
        };
    }

    private createTokens(id: string) {
        const data = { id };
        const accessToken = this.jwtService.sign(data, {
            expiresIn: '1h',
        });

        const refreshToken = this.jwtService.sign(data, {
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    public addRefreshTokenToCookies(res: Response, refreshToken: string) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            domain: 'localhost',
            secure: true,
            sameSite: 'strict',
            expires,
            signed: true,
        });
    }

    public removeRefreshTokenFromCookies(res: Response) {
        res.cookie('refreshToken', '', {
            httpOnly: true,
            domain: 'localhost',
            secure: true,
            sameSite: 'none',
            expires: new Date(0),
        });
    }
}

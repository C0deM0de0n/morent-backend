import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import type { Users } from 'generated/prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
		private configService: ConfigService,
		private userService: UserService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET') as string
		})
	}

	async validate(data: { id: string }): Promise<Users | null> {
			return this.userService.getById(data.id)
	}
}

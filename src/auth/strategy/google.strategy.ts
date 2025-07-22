import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import type { Profile } from 'passport';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const { provider, id, emails, name, photos } = profile;
        const user = {
            providerAccountId: id,
			provider,
            email: emails?.[0].value,
            name: name?.givenName,
            picture: photos?.[0].value,
            method: 'GOOGLE'
        };

        done(null, user);
    }
}

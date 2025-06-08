import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth2'


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(private configService: ConfigService) {
		super({
			clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
			clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
			callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') as string,
			scope: ['email', 'profile'],
		})
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: any,
		done: VerifyCallback
	): Promise<any> {
		const { id, name, emails, photos } = profile
		const user = {
			googleId: id,
      email: emails[0].value,
      name: name.givenName,
			surname: name.familyName,
      picture: photos[0].value,
		}

		done(null, user)
	}
}

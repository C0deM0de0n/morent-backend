import type { GoogleRecaptchaModuleOptions } from '@nestlab/google-recaptcha';
import { ConfigService } from '@nestjs/config';
import { isDev } from 'src/libs/common/utils/is-dev';

export const getGoogleRecaptchaConfig = async (
    configService: ConfigService,
): Promise<GoogleRecaptchaModuleOptions> => ({
    secretKey: configService.getOrThrow<string>('GOOGLE_RECAPTCHA_SECRET_KEY'),
    response: req => req.headers.recaptcha,
    skipIf: isDev(configService),
});

import { ConfigService } from '@nestjs/config';

export const redisConfig = (configService: ConfigService) => ({
	type: 'single' as const,
	url: configService.get<string>('REDIS_URL')
})
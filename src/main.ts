import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import CookieParser from 'cookie-parser'
import session from 'express-session'
import msToNumber from './libs/common/utils/ms'
import { createClient } from 'redis'
import { parseBoolean } from './libs/common/utils/parse-boolean'
import { AppModule } from './app.module'
import type { StringValue } from 'ms'

async function bootstrap() {
	const { RedisStore } = require('connect-redis')
	const app = await NestFactory.create(AppModule)
	const config = app.get(ConfigService)
	const redis = createClient({
		url: config.getOrThrow<string>('REDIS_URL')
	})
	redis.connect().catch((error) => console.log(error))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		})
	)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie'],
	})

	app.use(CookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: true,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_DOMAIN'),
				maxAge: msToNumber(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
				secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
				sameSite: 'lax',
			},
			store: new RedisStore({
				client: redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER'),
			}),
		})
	)

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()

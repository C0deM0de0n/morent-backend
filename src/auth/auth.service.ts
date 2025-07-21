import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserService } from 'src/user/user.service'
import { RegisterDto } from './dto/register.dto'
import { AuthMethod, type User } from 'generated/prisma'
import { Request, Response } from 'express'
import { LoginDto } from './dto/login.dto'
import { verify } from 'argon2'

@Injectable()
export class AuthService {
	public constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {}

	public async register(
		req: Request,
		dto: RegisterDto
	): Promise<User> {
		const isExist = await this.userService.findByEmail(dto.email)

		if (isExist) {
			throw new ConflictException(
				'Register is failed. User with this email is already exist, please use 	another email or try to login instead'
			)
		}

		const newUser = await this.userService.create(
			dto.email,
			dto.password,
			dto.name,
			'',
			AuthMethod.CREDENTIALS,
			false
		)

		return this.saveSession(req, newUser)
	}

	public async login(
		req: Request,
		dto: LoginDto
	): Promise<User> {
		const isExist = await this.userService.findByEmail(dto.email)

		if(!isExist || !isExist.password) {
			throw new NotFoundException(
				'User not found, register a new account or try another way to login'
			)
		}

		const isValidPassword = await verify(
			isExist.password, dto.password
		)

		if(!isValidPassword) {
			throw new UnauthorizedException('Invalid email or password')
		}

		return this.saveSession(req, isExist)
	}

	public async logout(
		req: Request,
		res: Response
	): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.destroy((error) => {
				if(error) {
					return reject(
						new InternalServerErrorException(
							'Failed to destroy a session'
						)
					)
				}
				res.clearCookie(
					this.configService.getOrThrow<string>('SESSION_NAME')
				)
				resolve()
			})
		})
	}

	private async saveSession(
		req: Request, 
		user: User
	): Promise<User> {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id

			req.session.save((error) => {
				if (error) {
					return reject(
						// new InternalServerErrorException(
						// 	'Failed to save session. Please make sure if session settings are okay'
						// )
						console.log(error)
					)
				}

				return resolve(user)
			})
		})
	}
}

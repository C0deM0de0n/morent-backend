import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/libs/prisma/prisma.service'
import { hash } from 'argon2'
import type { User, AuthMethod } from 'generated/prisma'


@Injectable()
export class UserService {
	public constructor(
		private readonly prismaService: PrismaService
	) {}

	public async findById(
		id: string
	): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: {
				id,
			},
			include: {
				accounts: true,
			},
		})

		if (!user) {
			throw new NotFoundException(
				'User not found, make sure you enter a correct data'
			)
		}

		return user
	}

	public async findByEmail(
		email: string
	): Promise<User | null> {
		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
			include: {
				accounts: true
			}
		})

		return user
	}

	public async create(
		email: string,
		name: string,
		picture: string,
		password: string,
		method: AuthMethod,
		isVerified: boolean
	): Promise<User> {
		const user = await this.prismaService.user.create({
			data: {
				email,
				name,
				picture,
				password: password ? await hash(password) : '',
				method,
				isVerified
			}, 
			include: {
				accounts: true
			}
		})

		return user
	}
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service'
import type { User } from 'generated/prisma';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	getById(id: string) {
		return this.prismaService.user.findUnique({ where: { id } })
	}

	getByEmail(email: string) {
		return this.prismaService.user.findUnique({ where: { email } })
	}

	gteByMobile(mobile: string) {
		return this.prismaService.user.findUnique({ where: { mobile } })
	}

	create(data: Partial<User>) {
		return this.prismaService.user.create({
				data: data
			})
	}
}

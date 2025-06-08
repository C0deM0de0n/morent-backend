import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service'
import type { Users } from 'generated/prisma';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	getById(id: string) {
		return this.prismaService.users.findUnique({ where: { id } })
	}

	getByEmail(email: string) {
		return this.prismaService.users.findUnique({ where: { email } })
	}

	gteByMobile(mobile: string) {
		return this.prismaService.users.findUnique({ where: { mobile } })
	}

	create(data: Partial<Users>) {
		return this.prismaService.users.create({
				data: data
			})
	}
}

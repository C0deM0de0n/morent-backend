import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import type { User } from 'generated/prisma';
import type { TProviderAuth } from 'src/auth/types/provider-auth';
import { hash } from 'argon2'

@Injectable()
export class UserService {
    public constructor(private readonly prismaService: PrismaService) {}

    public async findByProvider(
        provider: string, 
        providerAccountId: string
    ): Promise<User | null> {
        const account =  await this.prismaService.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider,
                    providerAccountId
                }
            },
            include: {
                user: true
            }
        })

        return account?.user ??  null
    }

    public async findById(id: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id,
            },
            include: {
                accounts: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found, make sure you enter a correct data');
        }

        return user;
    }

    public async findByEmail(email: string): Promise<User | null> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: {
                accounts: true,
            },
        });

        return user;
    }

    public async createWithCredentials(dto: RegisterDto): Promise<User> {
        const { passwordRepeat, ...data } = dto
        const user = await this.prismaService.user.create({
            data: {
                ...data,
                password: await hash(dto.password),
                method: 'CREDENTIALS'
            },
            include: {
                accounts: true,
            },
        });

        return user;
    }

    public async createWithProvider(providerData: TProviderAuth): Promise<User> {
        const { providerAccountId, provider, ...data } = providerData
        const user = await this.prismaService.user.create({
            data: {
                ...data,
                isVerified: true,
                accounts: {
                    create: {
                        provider,
                        providerAccountId
                    }
                }
            },
            include: {
                accounts: true,
            },
        });

        return user;
    }
}

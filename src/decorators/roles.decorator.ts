import { SetMetadata } from '@nestjs/common'
import { Role } from 'generated/prisma'

export const ROLES_KEYS = 'roles' as const

export const Roles = (...roles: Role[]) =>
	SetMetadata(ROLES_KEYS, roles)

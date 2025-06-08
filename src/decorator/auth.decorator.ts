import { UseGuards } from '@nestjs/common'
import { jwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { RoleGuard } from 'src/guard/role.guard'

export const Auth = () => UseGuards(jwtAuthGuard, RoleGuard)

import { UseGuards } from '@nestjs/common'
import { jwtAuthGuard } from 'src/auth/guard/jwt.guard'

export const Auth = () => UseGuards(jwtAuthGuard)

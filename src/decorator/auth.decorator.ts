import { UseGuards } from '@nestjs/common';
import { jwtAuthGuard } from 'src/guard/jwt.guard';

export const Auth = () => UseGuards(jwtAuthGuard)
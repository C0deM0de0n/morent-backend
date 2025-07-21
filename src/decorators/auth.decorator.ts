import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from './roles.decorator';
import { Role } from 'generated/prisma'

export function Authorization(...roles: Role[]) {
	if(roles.length > 0) {
		return applyDecorators(
			Roles(...roles),
			UseGuards(AuthGuard, RolesGuard)
		)
	}

	return applyDecorators(UseGuards(AuthGuard))
}
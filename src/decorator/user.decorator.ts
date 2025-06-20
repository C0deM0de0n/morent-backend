import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Users } from 'generated/prisma';

export const CurrentUser = createParamDecorator(
	(data: keyof Users, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()

		const user = request.user

		return data ? user[data] : user
	}
)
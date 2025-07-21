import { 
	Injectable, 
	CanActivate, 
	ExecutionContext, 
	ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'
import { ROLES_KEYS } from 'src/decorators/roles.decorator';
import type { Role } from 'generated/prisma'

@Injectable() 
export class RolesGuard implements CanActivate {
	public constructor(
		private readonly reflector: Reflector
	) {}

	public async canActivate(
		context: ExecutionContext
	): Promise<boolean> {
			const roles = this.reflector.getAllAndOverride<Role[]>(
				ROLES_KEYS,
				[
					context.getHandler(),
					context.getClass()
				]
			)

			if(!roles) return true

			const request = context.switchToHttp().getRequest()
			const user = request.user

			if(!roles.includes(user.role)) {
				throw new ForbiddenException(
					'You do not have permission to access this resource'
				)
			}

			return true
	}
}
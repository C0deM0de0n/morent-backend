import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Roles } from 'src/decorator/role.decorator'

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest()
		const roles = this.reflector.get(Roles, context.getHandler())

		if (!roles) return true

		const user = request.user
		
		return roles.some(role => role === user.role)
	}
}

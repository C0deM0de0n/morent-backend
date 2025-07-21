
import { 
	Injectable, 
	CanActivate, 
	ExecutionContext, 
	ForbiddenException,
	UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express'
import { UserService } from 'src/user/user.service';

@Injectable() 
export class AuthGuard implements CanActivate {
	public constructor(
		private readonly userService: UserService
	) {}

	public async canActivate(
		context: ExecutionContext
	): Promise<boolean> {
		const req = context.switchToHttp().getRequest()

		if(typeof req.session.userId === 'undefined') {
			throw new UnauthorizedException(
				'Unauthorized, Please sign in to continue'
			)
		}

		const user = await this.userService.findById(req.session.userId)

	 	req.user  = user

		return true
	}
}
import { ValidatorConstraint } from 'class-validator'
import  { RegisterDto } from 'src/auth/dto/register.dto'
import type { ValidationArguments, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ name: 'IsPasswordsMatchingConstraint', async: false })
export class IsPasswordsMatchingConstraint
	implements ValidatorConstraintInterface 
{
	public validate(
		passwordRepeat: string, args: ValidationArguments
	): boolean {
		const obj = args.object as RegisterDto
		return passwordRepeat === obj.password
	}

	public defaultMessage(
		args: ValidationArguments
	): string {
		return 'Passwords do not match'		
	}
}

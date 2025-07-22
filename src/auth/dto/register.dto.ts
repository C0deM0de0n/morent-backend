import { 
	IsString,
	IsEmail,
	IsNotEmpty,
	MinLength,
	Validate
} from 'class-validator';
import { IsPasswordsMatchingConstraint } from '../decorators/is-passwords-matching-constraint';

export class RegisterDto {
	@IsString({ message: 'Name must be a string' })
	@IsNotEmpty({ message: 'Name is required' })
	name: string

	@IsString({ message: 'Email must be a string' })
	@IsEmail({}, { message: 'Email must be a correct' })
	@IsNotEmpty({ message: 'Email is required' })
	email: string 

	@IsString({ message: 'Password must be a string' })
	@IsNotEmpty({ message: 'Password is required' })
	@MinLength(6, {
		message: 'Password must have a 6 letters minimum'
	})
	password: string

	@IsString({ message: 'Password-repeat must be a string' })
	@IsNotEmpty({ message: 'Password-repeat is required' })
	@MinLength(6, {
		message: 'Password-must have a 6 letters minimum'
	})
	@Validate(IsPasswordsMatchingConstraint)
	passwordRepeat: string
}
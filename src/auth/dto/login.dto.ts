import { 
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength 
} from 'class-validator';

export class LoginDto {
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
}
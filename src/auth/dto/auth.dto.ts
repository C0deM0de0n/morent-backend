import { Matches } from 'class-validator';

export class SendMobileVerify {
	@Matches(/^(\+48)\d{9}$/, {
		 message: 'Phone number must be a valid Polish mobile number',
	})
	mobile: string
}

export class VerifyMobileCode {
	@Matches(/^(\+48)\d{9}$/, {
		 message: 'Phone number must be a valid Polish mobile number',
	})
	mobile: string

	@Matches(/\d{6}/, {
		message: 'Code must have 6 numbers'
	})
	code: string
}
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'

@ValidatorConstraint({ name: 'FullDayRange', async: false })
export class FullDayRangeValidator implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const obj = args.object as any
    const pickUp = new Date(obj.pickUp)
    const dropOff = new Date(obj.dropOff)

    const oneDayMs = 24 * 60 * 60 * 1000
    const diff = dropOff.getTime() - pickUp.getTime()

    const timesValid =
      pickUp.getUTCHours() === 0 &&
      pickUp.getUTCMinutes() === 0 &&
      pickUp.getUTCSeconds() === 0 &&
      dropOff.getUTCHours() === 0 &&
      dropOff.getUTCMinutes() === 0 &&
      dropOff.getUTCSeconds() === 0

    const durationValid = diff >= oneDayMs && diff % oneDayMs === 0

    return timesValid && durationValid
  }

  defaultMessage(_: ValidationArguments) {
    return 'Dates must be at 00:00 and the rental must be at least 1 full day with full-day steps only.'
  }
}

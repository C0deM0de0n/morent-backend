import { Controller, Get, HttpCode } from '@nestjs/common';
import { Authorization } from 'src/decorators/auth.decorator'
import { Authorized } from 'src/decorators/authorized.decorator'
import { UserService } from './user.service';
import { User } from 'generated/prisma'

@Controller('user')
export class UserController {
  public constructor(
    private readonly userService: UserService
  ) {}

  @Get('profile')
  @Authorization('USER')
  @HttpCode(200)
  public async getProfile(@Authorized('id') userId: string): Promise<User> {
    return this.userService.findById(userId)
  }
}

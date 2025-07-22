import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtConfig } from './config/jwt.config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    GoogleStrategy,
  ],
})
export class AuthModule {}

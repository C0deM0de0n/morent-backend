import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { UserModule } from 'src/user/user.module'
import { jwtConfig } from 'src/config/jwt.config';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { GoogleStrategy } from 'src/strategy/google.strategy';


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
    PrismaService, 
    JwtStrategy, 
    GoogleStrategy,
  ],
})
export class AuthModule {}

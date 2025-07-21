import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './libs/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrderModule } from './order/order.module';
import { IS_DEV_ENV } from './libs/common/utils/is-dev';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV
    }),
    PrismaModule,
    AuthModule,
    UserModule, 
    ProductModule, 
    ReviewsModule, 
    FavoritesModule, 
    OrderModule, 
  ],
})
export class AppModule {}

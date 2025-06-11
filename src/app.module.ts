import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [AuthModule, UserModule, ProductModule, ReviewsModule, FavoritesModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

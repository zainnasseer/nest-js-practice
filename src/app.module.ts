import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { Product } from "./products/product.entity";
import { User } from "./users/user.entity";
import { Review } from "./reviews/review.entity";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { UploadsModule } from "./uploads/uploads.module";
import { MailModule } from "./mail/mail.module";
import { LoggerMiddleware } from "./utils/interceptors/middlewares/logger.middleware";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    //forRoot is used to register the module in the root module.
    ConfigModule.forRoot({
      isGlobal: true, // makes the ConfigModule available in all other modules
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], //ConfigService used to access env variables
      useFactory: (config: ConfigService) => {
        return {
          type: "postgres",
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD"),
          host: "localhost",
          port: config.get<number>("DB_PORT"),
          synchronize: process.env.NODE_ENV !== "production", // true if aint prod.
          entities: [Product, User, Review],
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // after 60 seconds
        limit: 10, // 10 requests
      },
    ]),
    UsersModule,
    ProductsModule,
    ReviewsModule,
    UploadsModule,
    MailModule,
  ],

  exports: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, // apply serializer interceptor to all
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // apply throttler guard to all
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware) // can apply multiple middlewares in sequence
      .forRoutes({
        path: "*",
        method: RequestMethod.GET,
      });

    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "api/users/auth/login", method: RequestMethod.ALL });
  }
}

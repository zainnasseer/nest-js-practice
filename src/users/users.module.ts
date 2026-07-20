import { BadRequestException, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import type { StringValue } from "ms";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { AuthProvider } from "./auth.provider";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { MailModule } from "../mail/mail.module";

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthProvider],
  exports: [UsersService, AuthProvider],

  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]), // detect the entity
    JwtModule.registerAsync({
      global: true, // makes the jwtService available globally (no need to import it in every module)
      inject: [ConfigService], // ConfigService is used to access env variables
      // useFactory is a function that returns an object that will be used to configure the module.
      useFactory: (config: ConfigService) => {
        return {
          global: true, // no need to import it in every module
          secret: config.get<string>("JWT_SECRET"),
          // signOptions is an object that contains options for signing the JWT
          signOptions: {
            expiresIn: config.get<StringValue>("JWT_EXPIRES_IN"), // 1d, 1w, 1m, 1y
          },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: "./images/users",
        filename: (req, file, cb) => {
          const prefix = `Users-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileName = `${prefix}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
      fileFilter(req, file, cb) {
        if (file.mimetype.startsWith("image")) cb(null, true);
        else {
          cb(new BadRequestException("Invalid file type"), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 10 },
    }),
  ],
})
export class UsersModule {}

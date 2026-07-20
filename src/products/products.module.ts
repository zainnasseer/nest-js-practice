import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Product } from "./product.entity";
import { UsersModule } from "../users/users.module";
// import { JwtModule } from "@nestjs/jwt"; // made it global from users module, so no need to import it at every module.

@Module({
  //importing the users module will give us access to the UsersService, and because users module exports it, we can use it here.
  imports: [TypeOrmModule.forFeature([Product]), UsersModule], // forFeature is used to register the entity also prevent circular dependency.
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

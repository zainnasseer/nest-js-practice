import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Query,
} from "@nestjs/common";

import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { ProductsService } from "./products.service";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { AuthRolesGuard } from "../users/guards/auth.roles.guards";
import { UserTypeEnum } from "../utils/enums";
import { Roles } from "../users/decorators/user-role.decorator";
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from "@nestjs/swagger";
import { SkipThrottle, Throttle } from "@nestjs/throttler";

@Controller("/api/products")
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST localhost:3000/api/products
  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @ApiSecurity("bearer")
  public createNewProduct(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: CreateProductDto
  ) {
    return this.productsService.createProduct(payload.id, body);
  }

  // GET localhost:3000/api/products?title=product
  // GET localhost:3000/api/products
  @Get()
  @ApiResponse({ status: 200, description: "Successful Response" })
  @ApiOperation({
    summary: "Get all products",
    description: "Returns all products with filtering capabilities",
  })
  @ApiQuery({
    name: "title",
    required: false,
    type: String,
    description: "product title",
    example: "Potato",
  })
  @ApiQuery({ name: "minPrice", required: false, type: Number })
  @ApiQuery({ name: "maxPrice", required: false, type: Number })
  public getAllProducts(
    @Query("title") title?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string
  ) {
    return this.productsService.getAllProducts(title, minPrice, maxPrice);
  }

  // GET localhost:3000/api/products/:id
  @Get(":id")
  // @SkipThrottle()
  @Throttle({ default: { ttl: 60000, limit: 12 } })
  public getOneProduct(@Param("id", ParseIntPipe) id: number) {
    // any URL param is string by default, so we use ParseIntPipe to convert it to number.
    return this.productsService.getOneBy(id);
  }

  // PUT localhost:3000/api/products/:id
  @Put(":id")
  @SkipThrottle()
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @ApiSecurity("bearer")
  public updateProduct(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateProductDto
  ) {
    return this.productsService.updateProduct(id, body);
  }

  // DELETE localhost:3000/api/products/:id
  @Delete(":id")
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @ApiSecurity("bearer")
  public deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}

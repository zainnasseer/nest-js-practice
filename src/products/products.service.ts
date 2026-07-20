import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Like, Repository } from "typeorm";

import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { Product } from "./product.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly usersService: UsersService
  ) {}

  // POST localhost:3000/api/products/express-way
  // Request<P, ResBody, ReqBody, ReqQuery, Locals>
  // Here:
  // P = unknown (route params not typed)
  // ResBody = unknown (response body not typed)
  // ReqBody = CreateProductDto ✅ so req.body.title/price are properly typed
  // ReqQuery and Locals are left to their defaults
  //   public createProductExpressWay(
  //     @Req() req: Request<unknown, unknown, CreateProductDto>,
  //     @Res({ passthrough: true }) res: Response,
  //     @Headers() headers: any
  //   ) {
  //     const newProduct: ProductType = {
  //       id: this.products.length + 1,
  //       title: req.body.title,
  //       price: req.body.price,
  //     };
  //     this.products.push(newProduct);
  //     console.log("Request Headers:", headers);
  //     res.status(201).json(newProduct);

  //     // we might need to use this way to use res.cookie
  //     // res.cookie("authCookie", "this is a cookie", {
  //     //   httpOnly: true,
  //     //   maxAge: 120,
  //     // });
  //   }

  // POST localhost:3000/api/products
  /**
   *
   * @param userId
   * @param dto
   * @returns newProduct
   */
  public async createProduct(
    userId: number,
    dto: CreateProductDto
  ): Promise<Product> {
    const user = await this.usersService.getCurrentUser(userId);

    const newProduct = this.productsRepository.create({
      ...dto, // spread the dto (title, price, description) //
      title: dto.title.toLowerCase(), // convert title to lowercase
      user, // assign the user to the product
    });
    await this.productsRepository.save(newProduct);
    return newProduct;
  }

  // GET localhost:3000/api/products
  /**
   *
   * @returns All products in db
   */
  public getAllProducts(title?: string, minPrice?: string, maxPrice?: string) {
    const filters = {
      ...(title ? { title: Like(`%${title.toLowerCase()}%`) } : {}),
      ...(minPrice || maxPrice
        ? { price: Between(Number(minPrice), Number(maxPrice)) }
        : {}),
    };
    return this.productsRepository.find({
      where: filters,
      // relations: { user: true, reviews: true }, // i am using eager within the entity relationships instead of manually adding it here.
    });
  }

  // GET localhost:3000/api/products/:id
  // any URL param is string by default
  /**
   *
   * @param id
   * @returns product by id
   */
  public async getOneBy(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true, reviews: true }, // used eager instead in products entity
    });
    if (!product)
      throw new NotFoundException("Product not found", {
        description: `Product with id ${id} not found`,
      });
    return product;
  }

  // PUT ~/api/products/:id
  /**
   *
   * @param id
   * @param dto
   * @returns updatedProduct
   */
  public async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.getOneBy(id);

    if (dto.title) product.title = dto.title.toLowerCase();

    if (dto.description) product.description = dto.description;

    if (dto.price !== undefined) product.price = dto.price;

    return this.productsRepository.save(product);
  }

  // DELETE localhost:3000/api/products/:id
  /**
   *
   * @param id
   * @returns
   */
  public async deleteProduct(id: number) {
    const product = await this.getOneBy(id);
    await this.productsRepository.remove(product);
    return { message: `Product with id: '${id}' deleted successfully` };
  }
}

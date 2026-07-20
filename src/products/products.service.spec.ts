import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product } from "./product.entity";

describe("ProductsService", () => {
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: UsersService, useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
  });

  it("productsService should be defined", () => {
    expect(productsService).toBeDefined();
  });
});

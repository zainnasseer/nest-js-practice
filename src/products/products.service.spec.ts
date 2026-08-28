import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { FindOperator, Repository } from "typeorm";
import { CreateProductDto } from "./dtos/create-product.dto";

// ------------------------------- types -------------------------------
type MockProductType = {
  id: number;
  title: string;
  price: number;
};

/**
 * Options mirrors the shape passed to repository.find() by the service.
 * TypeORM wraps filter values in FindOperator objects:
 *   Like("%p1%")    => { _value: "%p1%",  _type: "ILIKE" }
 *   Between(1, 2)   => { _value: [1, 2],  _type: "Between" }
 * We type the where clause accordingly so the mock can unpack them.
 */
type Options = {
  where: { title?: FindOperator<string>; price?: FindOperator<number> };
};

// REPOSITORY_TOKEN is a constant derived from a pure function — no need to recompute it per test.
const REPOSITORY_TOKEN = getRepositoryToken(Product);

describe("ProductsService", () => {
  let productsService: ProductsService;
  let productsRepository: Repository<Product>;

  const mockCreateProductDto: CreateProductDto = {
    title: "test",
    description: "test description",
    price: 1,
  };

  let products: MockProductType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: "p1", price: 1 },
      { id: 2, title: "p2", price: 2 },
      { id: 3, title: "p3", price: 3 },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: UsersService,
          useValue: {
            getCurrentUser: jest.fn((userId: number) =>
              Promise.resolve({ id: userId })
            ),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn((dto: CreateProductDto) => dto),
            save: jest.fn((dto: CreateProductDto) =>
              Promise.resolve({ ...dto, id: 1 })
            ),
            find: jest.fn((options?: Options) => {
              // title: Like("%p1%") — strip the % wildcards to get the search term
              const titleOp = options?.where?.title;
              if (titleOp) {
                const term = titleOp.value.replace(/%/g, "");
                return Promise.resolve(
                  products.filter((product) => product.title.includes(term))
                );
              }

              // price: Between(1, 2) — value is a [min, max] tuple
              // Cast via unknown because FindOperator<number>.value is typed as
              // `number | FindOperator<number>`, not `[number, number]` by TypeORM.
              const priceOp = options?.where?.price;
              if (priceOp) {
                const [minPrice, maxPrice] = priceOp.value as unknown as [
                  number,
                  number,
                ];
                return Promise.resolve(
                  products.filter(
                    (product) =>
                      product.price >= minPrice && product.price <= maxPrice
                  )
                );
              }

              return Promise.resolve(products);
            }),
          },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<Repository<Product>>(REPOSITORY_TOKEN);
  });

  // Reset mock call counts after every test to prevent cross-test interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("productsService should be defined", () => {
    expect(productsService).toBeDefined();
  });

  it("productsRepository should be defined", () => {
    expect(productsRepository).toBeDefined();
  });

  // createProduct() tests
  describe("createProduct()", () => {
    it("should call repository.create()", async () => {
      await productsService.createProduct(1, mockCreateProductDto);
      expect(productsRepository.create).toHaveBeenCalled();
      expect(productsRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should call repository.save()", async () => {
      await productsService.createProduct(1, mockCreateProductDto);
      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should return the newly created product", async () => {
      const result = await productsService.createProduct(
        1,
        mockCreateProductDto
      );
      expect(result).toBeDefined();
      expect(result.title).toBe(mockCreateProductDto.title.toLowerCase());
      expect(result.price).toBe(mockCreateProductDto.price);
      expect(result.id).toBe(1);
    });
  });

  // getAllProducts() tests
  describe("getAllProducts()", () => {
    it("should call repository.find()", async () => {
      await productsService.getAllProducts();
      expect(productsRepository.find).toHaveBeenCalled();
      expect(productsRepository.find).toHaveBeenCalledTimes(1);
    });

    it("should return all products when no filters are applied", async () => {
      const result = await productsService.getAllProducts();
      expect(result).toBeDefined();
      expect(result).toEqual(products);
    });

    it("should return filtered products when title filter is applied", async () => {
      const result = await productsService.getAllProducts("p1");
      expect(result).toBeDefined();
      expect(result).toEqual(
        products.filter((product) => product.title.includes("p1"))
      );
    });

    it("should return filtered products when min and max price filters are applied", async () => {
      const result = await productsService.getAllProducts(undefined, "1", "2");
      expect(result).toBeDefined();
      expect(result).toEqual(
        products.filter((product) => product.price >= 1 && product.price <= 2)
      );
    });
  });
});

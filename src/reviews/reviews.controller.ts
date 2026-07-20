import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dtos/cretae-review.dto";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { AuthRolesGuard } from "../users/guards/auth.roles.guards";
import { Roles } from "../users/decorators/user-role.decorator";
import { UserTypeEnum } from "../utils/enums";
import { UpdateReviewDto } from "./dtos/update-review.dto";
import { PaginationQueryDto } from "../products/dtos/pagination-quey.dto";

@Controller("/api/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST localhost:3000/api/reviews/:productId
  @Post(":productId")
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.USER)
  public createReview(
    @Param("productId", ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: JWTPayloadType
  ) {
    return this.reviewsService.createReview(productId, payload.id, body);
  }

  // GET localhost:3000/api/reviews
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  public getAllReviews(@Query() query: PaginationQueryDto) {
    return this.reviewsService.getAllReviews(
      query.pageNo,
      query.reviewsPerPage
    );
  }

  // GET localhost:3000/api/reviews/:id
  @Get(":id")
  public getReviewById(@Param("id", ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }

  // PUT localhost:3000/api/reviews/:id
  @Put(":id")
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.USER)
  public editReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: JWTPayloadType
  ) {
    return this.reviewsService.editReview(id, payload.id, body);
  }

  // DELETE localhost:3000/api/reviews/:id
  @Delete(":id")
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.USER)
  public deleteReview(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType
  ) {
    return this.reviewsService.deleteReview(id, payload.id);
  }
}

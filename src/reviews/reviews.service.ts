import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "./review.entity";
import { Repository } from "typeorm";
import { ProductsService } from "../products/products.service";
import { CreateReviewDto } from "./dtos/cretae-review.dto";
import { UsersService } from "../users/users.service";
import { UpdateReviewDto } from "./dtos/update-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productService: ProductsService,
    private readonly usersService: UsersService
  ) {}

  /**
   *
   * @param productId
   * @param userId
   * @param dto data sent through body by user adding review
   * @returns created review
   */
  public async createReview(
    productId: number,
    userId: number,
    dto: CreateReviewDto
  ) {
    const product = await this.productService.getOneBy(productId);
    const user = await this.usersService.getCurrentUser(userId);

    const newReview = this.reviewsRepository.create({ ...dto, product, user });
    const response = await this.reviewsRepository.save(newReview);
    return {
      productId: product.id,
      productTitle: product.title,

      userId: user.id,
      username: user.username,
      email: user.email,

      id: response.id,
      rating: response.rating,
      comment: response.comment,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  }

  /**
   * Get all reviews
   * @returns allReviews
   */
  public async getAllReviews(pageNo: number, reviewsPerPage: number) {
    const allReviews = await this.reviewsRepository.find({
      skip: ((pageNo - 1) * reviewsPerPage) | 1,
      take: reviewsPerPage,
      order: { createdAt: "DESC" },
      // relations: { product: true },
    });
    return allReviews;
  }

  /**
   * Get review by id
   * @param id review id
   * @returns review by id
   */
  public async getReviewById(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });
    if (!review) throw new NotFoundException("Review not found");
    return review;
  }

  /**
   * Edit a review
   * @param reviewId review id
   * @param userId user id
   * @param dto updateReviewDto
   * @returns updated review
   */
  public async editReview(
    reviewId: number,
    userId: number,
    dto: UpdateReviewDto
  ) {
    const review = await this.getReviewById(reviewId);

    if (!review.user || review.user.id !== userId) {
      throw new ForbiddenException("You are not the owner of this review.");
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    //     // Dynamically copy defined properties from dto to review (useful when dealing with multiple field dto)
    // Object.assign(review, dto);
    const updatedReview = await this.reviewsRepository.save(review);

    return {
      // updatedReview,
      productId: updatedReview.product!.id,
      productTitle: updatedReview.product!.title,

      userId: updatedReview.user!.id,
      username: updatedReview.user!.username,
      email: updatedReview.user!.email,

      id: updatedReview.id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
    };
  }

  /**
   * Delete review
   * @param reviewId
   * @param userId
   * @returns
   */
  public async deleteReview(reviewId: number, userId: number) {
    const review = await this.getReviewById(reviewId);

    if (!review.user || review.user.id !== userId) {
      throw new ForbiddenException("You are not the owner of this review.");
    }

    await this.reviewsRepository.remove(review);
    return { message: `Review with id: '${reviewId}' deleted successfully` };
  }
}

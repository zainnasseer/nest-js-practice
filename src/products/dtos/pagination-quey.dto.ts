import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationQueryDto {
  @Type(() => Number) // Convert query string to number
  @IsInt()
  @Min(1, { message: "pageNo must be a positive integer starting from 1" })
  pageNo!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1, {
    message: "reviewsPerPage must be a positive integer starting from 1",
  })
  @IsOptional()
  reviewsPerPage: number = 3;
}

import {
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsPositive()
  rating!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  comment?: string;
}

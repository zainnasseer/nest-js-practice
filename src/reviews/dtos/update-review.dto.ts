import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @IsPositive()
  rating?: number;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(500)
  comment?: string;
}

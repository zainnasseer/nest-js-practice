import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional()
  price?: number; // declare
}

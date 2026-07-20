import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  @ApiProperty()
  title!: string; // ! indicates that  property is mandatory

  @IsOptional()
  @IsString()
  @Length(0, 500)
  @ApiProperty()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty()
  price!: number;
}

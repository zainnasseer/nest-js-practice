import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

export class UpdateUserdto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  username?: string;

  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 128)
  password?: string;
}

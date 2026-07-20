import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

export class RegisterDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  username?: string;

  @IsNotEmpty()
  @MaxLength(150)
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 128)
  password!: string;
}

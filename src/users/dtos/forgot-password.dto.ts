import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email!: string;
}

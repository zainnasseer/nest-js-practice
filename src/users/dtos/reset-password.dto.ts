import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 128)
  newPassword!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId!: number;

  @IsNotEmpty()
  @IsString()
  resetPasswordToken!: string;
}

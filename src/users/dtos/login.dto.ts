import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    required: true,
    type: String,
    example: "[EMAIL_ADDRESS]",
    description: "User's email",
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: "123456",
    description: "User's password",
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 128)
  password!: string;
}

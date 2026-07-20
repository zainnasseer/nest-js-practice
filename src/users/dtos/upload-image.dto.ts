import { ApiProperty } from "@nestjs/swagger";
import type { Express } from "express";

export class UploadImageDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    required: true,
    name: "profileImage", //Must match the key in file upload, same as in controller
    description: "Image file to be uploaded",
    example: "image.jpg",
  })
  file!: Express.Multer.File;
}

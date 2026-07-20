import { ApiProperty } from "@nestjs/swagger";

export class FilesUploadDto {
  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    name: "files", // as in controller
  })
  files!: Array<Express.Multer.File>;
}

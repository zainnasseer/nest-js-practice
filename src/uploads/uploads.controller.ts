import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import type { Response } from "express";
import { FilesUploadDto } from "./dtos/files-upload.dto";

@Controller("api/uploads")
export class UploadsController {
  // POST localhost:3000/api/uploads
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");

    console.log("file Uploaded", file);
    return file.filename;
  }

  // POST localhost:3000/api/uploads/multiple-files
  @Post("/multiple-files")
  @UseInterceptors(FilesInterceptor("files"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: FilesUploadDto,
    description: "Multiple Files",
  })
  public uploadMultipleFiles(
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (!files || files.length == 0)
      throw new BadRequestException("No files uploaded");

    console.log("multiple files uploaded", { files });
    return files.map((file) => file.filename);
  }

  // GET /api/uploads/:imagename
  @Get(":imagename")
  public getImage(@Param("imagename") imagename: string, @Res() res: Response) {
    return res.sendFile(imagename, { root: "./images" });
  }
}

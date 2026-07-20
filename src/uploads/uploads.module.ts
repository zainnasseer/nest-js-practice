import { BadRequestException, Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Module({
  controllers: [UploadsController],
  imports: [
    MulterModule.register({
      // file is the fieldname in form data. or key in x-www-form-urlencoded
      storage: diskStorage({
        destination: "./images",

        filename: (req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) cb(null, true);
        else
          cb(
            new BadRequestException(
              "Invalid file type. Only images are allowed"
            ),
            false
          );
      },
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB in bytes
        // files: 5, // Maximum number of files
        // fieldNameSize: 100, // Maximum size of the field name
        // fieldSize: 100, // Maximum size of the field value
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class UploadsModule {}

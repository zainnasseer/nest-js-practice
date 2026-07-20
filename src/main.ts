import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  app.use(helmet());

  app.enableCors({
    origin: "http://localhost:4000",
  });

  const swagger = new DocumentBuilder()
    .setTitle("NestJS API")
    .setDescription("API description")
    .addServer("http://localhost:3000", "Local Environment")
    .setVersion("1.0")
    .addSecurity("bearer", {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    })
    .addBearerAuth()
    .build();

  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup("swagger", app, documentation); // localhost:3000/swagger

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

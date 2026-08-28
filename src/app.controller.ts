import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("/")
  public getHome() {
    return { message: "App working!" };
  }
}

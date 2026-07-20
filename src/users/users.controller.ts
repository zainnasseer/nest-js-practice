import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  UseGuards,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  BadRequestException,
  UploadedFile,
  Res,
  Query,
  // Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthProvider } from "./auth.provider";
// import type { Request } fro§m "express";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthGuard } from "./guards/auth.guards";
import type { JWTPayloadType } from "../utils/types";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Roles } from "./decorators/user-role.decorator";
import { UserTypeEnum } from "../utils/enums";
import { AuthRolesGuard } from "./guards/auth.roles.guards";
import { UpdateUserdto } from "./dtos/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import { UploadImageDto } from "./dtos/upload-image.dto";

// import { CURRENT_USER_KEY } from "../utils/constants";

// type AuthenticatedRequest = Request & {
//   [CURRENT_USER_KEY]: StringValue;
// };

@Controller("api/users")
@UseInterceptors(ClassSerializerInterceptor) // activate guards?
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authProvider: AuthProvider
  ) {}

  // POST localhost:3000/api/users/auth/register
  @Post("auth/register")
  public register(@Body() body: RegisterDto) {
    return this.authProvider.register(body);
  }

  // POST localhost:3000/api/users/auth/login
  @Post("auth/login")
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.authProvider.login(body);
  }

  // POST localhost:3000/api/users/auth/verify-email/{id}/token={token}
  @Get("auth/verify-email")
  @HttpCode(HttpStatus.OK)
  public verifyEmail(
    @Query("id", ParseIntPipe) id: number,
    @Query("token") token: string
  ) {
    return this.authProvider.verifyEmail(id, token);
  }

  // POST ~/api/users/auth/forgot-password
  @Post("auth/forgot-password")
  @HttpCode(HttpStatus.OK)
  public async sendForgotPasswordLink(
    @Body() body: ForgotPasswordDto
  ): Promise<{ message: string }> {
    return await this.usersService.sendResetPassword(body.email);
  }

  // GET ~/api/users/auth/forgot-password/:id/:token
  @Get("auth/forgot-password/:id/:token")
  @HttpCode(HttpStatus.OK)
  public async checkResetPasswordToken(
    @Param("id", ParseIntPipe) id: number,
    @Param("token") token: string
  ): Promise<{ message: string }> {
    return await this.usersService.checkResetToken(id, token);
  }

  // POST ~/api/users/auth/reset-password
  @Post("auth/reset-password")
  @HttpCode(HttpStatus.OK)
  public async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.usersService.resetPassword(body);
  }

  // GET localhost:3000/api/users
  @Get()
  @Roles(UserTypeEnum.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // GET localhost:3000/api/users/current-user
  @Get("current-user")
  @UseGuards(AuthGuard) // guard works before endpoint (will check if bearer token exists or not).
  @ApiSecurity("bearer")
  public getLoggedUser(@CurrentUser() payload: JWTPayloadType) {
    console.log("Route called here..");
    return this.usersService.getCurrentUser(payload.id);
  }

  //Header method
  // select "Authorization" field from the header, if not selected, the whole header will be sent
  // public getLoggedUser(
  //   @Headers("Authorization") authorization: JWTPayloadType
  // ) {
  //   // authorization is headers.authorization ( Bearer + token)
  //   return this.usersService.getCurrentUser(authorization);
  // }

  // another method, sending the payload
  // public getLoggedUser(@Req() request: AuthenticatedRequest) {
  //   const payload = request[CURRENT_USER_KEY]; // like request.user
  //   return this.usersService.getCurrentUser(payload.id);
  // }

  // Put localhost:3000/api/users
  @Put()
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.USER)
  @UseGuards(AuthRolesGuard)
  public updateUserData(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: UpdateUserdto
  ) {
    return this.usersService.updateUser(payload.id, body);
  }

  //Delete localhost:3000/api/users
  @Delete(":id")
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @CurrentUser() payload: JWTPayloadType,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.usersService.deleteUser(id, payload);
  }

  // Post localhost:3000//api/users/profile-image
  @Post("profile-image")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("profileImage"))
  @ApiSecurity("bearer")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: UploadImageDto,
    description: "Profile Image",
  })
  public async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JWTPayloadType
  ) {
    if (!file) throw new BadRequestException("No file uploaded");

    return await this.usersService.setProfileImage(payload.id, file.filename);
  }

  // GET /api/users/profile/get-image
  @Get("profile/get-image")
  @UseGuards(AuthGuard)
  public async getImage(
    @CurrentUser() payload: JWTPayloadType,
    @Res() res: Response
  ) {
    return this.usersService.getProfileImage(payload.id, res);
  }

  // DELETE ~/api/users/profile/remove-image
  @Delete("/profile/remove-image")
  @UseGuards(AuthGuard)
  public async removeProfileImage(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.removeProfileImage(payload.id);
  }
}

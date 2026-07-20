import {
  BadRequestException,
  forwardRef,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "./user.entity";

import { JWTPayloadType } from "../utils/types";
import { UpdateUserdto } from "./dtos/update-user.dto";
import { UserTypeEnum } from "../utils/enums";
import { join } from "path";
import { unlinkSync } from "fs";
import type { Response } from "express";
import { AuthProvider } from "./auth.provider";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import type { WrapperType } from "../utils/wrapper.type";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuthProvider))
    private readonly authProvider: WrapperType<AuthProvider>,
    private readonly jwtService: JwtService
  ) {}

  /**
   *  * GET LOGGED USER DATA
   *    payload supposed to be sent from guard
   *    through the controller @CurrentUser (request.user=payload) to get user.id.
   * @param id
   * @returns  user data from DB
   */
  public async getCurrentUser(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  /**
   * get all users
   * @returns
   */
  public async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  /**
   * Update logged user data
   * @param id
   * @param dto
   * @returns updated user data
   */
  public async updateUser(id: number, dto: UpdateUserdto): Promise<User> {
    // 1. Fetch user and throw 404 if not found
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");

    // 2. Handle unique email check if they are changing their email
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (emailExists)
        throw new BadRequestException("Email is already in use.");

      user.email = dto.email;
    }

    // 3. Update username if provided
    if (dto.username) user.username = dto.username;

    // 4. Update password if provided
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);

    return await this.usersRepository.save(user);
  }

  /**
   * Delete user
   * @param id user id
   * @param payload JWT payload
   * @returns message
   */
  public async deleteUser(id: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(id);

    if (user.id === payload?.id || payload.userType === UserTypeEnum.ADMIN) {
      await this.usersRepository.delete(id);
      return { message: "User deleted successfully." };
    }
    throw new ForbiddenException(
      "Access denied, you are not allowed to delete this user."
    );
  }

  /**
   *  GENERATE JSON WEB TOKEN
   * @param payload JWT payload
   * @returns token
   */
  public async generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload); // have id + userType
  }

  /**
   * set user profile image
   * @param userId
   * @param filename profile image filename
   * @returns user updated data
   */
  public async setProfileImage(userId: number, filename: string) {
    const user = await this.getCurrentUser(userId);

    if (user.profileImage == null) user.profileImage = filename;
    else {
      await this.removeProfileImage(userId);
      user.profileImage = filename;
    }
    return this.usersRepository.save(user);
  }

  /**
   * get user profile image
   * @param userId
   * @param res
   * @returns profile image
   *
   * Also, as a broader best practice — services ideally shouldn't know about Response at all.
   *  A cleaner pattern is to have the service return the file path/data, and let the controller handle res.sendFile().
   *  This keeps the service framework-agnostic and easier to test.
   */
  public async getProfileImage(userId: number, res: Response) {
    const user = await this.getCurrentUser(userId);

    if (!user.profileImage)
      throw new NotFoundException("No profile image found");

    const pImage = user.profileImage;

    return res.sendFile(pImage, { root: "./images/users" });
  }

  /**
   * remove user's profile image
   * @param userId
   * @returns user data after removing profile image
   */
  public async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage)
      throw new BadRequestException("User has no profile image.");

    //remove image from server
    const imagePath = join(
      process.cwd(), //process.cwd() return current working directory.
      `./images/users/${user.profileImage}`
    );
    unlinkSync(imagePath);

    //remove image from DB
    user.profileImage = null;
    return this.usersRepository.save(user);
  }

  /**
   * send reset password link
   * user will get reset password email template
   * @param email user's email
   * @returns message
   */
  public async sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
  }

  /**
   * check reset password token
   * @param userId user id
   * @param token reset password token
   * @returns message
   */
  public async checkResetToken(userId: number, token: string) {
    return this.authProvider.checkResetPasswordToken(userId, token);
  }

  /**
   * reset password
   * @param dto ResetPasswordDto
   * @returns message
   */
  public async resetPassword(dto: ResetPasswordDto) {
    return this.authProvider.resetPassword(dto);
  }
}

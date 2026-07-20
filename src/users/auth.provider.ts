import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

import { User } from "./user.entity";
import { RegisterDto } from "./dtos/register.dto";
// import { AccessTokenType } from "../utils/types";
import { LoginDto } from "./dtos/login.dto";
import { UsersService } from "./users.service";
import { MailService } from "../mail/mail.service";
import { ConfigService } from "@nestjs/config";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import type { WrapperType } from "../utils/wrapper.type";

// !!!! CAN BE NAMED AS AuthProvider / AuthService !!!!!!!
@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: WrapperType<UsersService>,
    private readonly mailService: MailService,
    private readonly config: ConfigService
  ) {}

  /**
   * Register into the account
   * @param dto
   * @returns
   */
  public async register(dto: RegisterDto): Promise<object> {
    const { username, email, password } = dto;

    const isRegistered = await this.usersRepository.findOne({
      where: { email },
    });
    if (isRegistered)
      throw new BadRequestException("User is already registered.");

    // const salt = await bcrypt.genSalt(10); // 10 is the number of rounds, the higher the number the more secure password but slower hashing process.
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      verificationToken: randomBytes(32).toString("hex"),
    });
    //check if newUser has been created or not, before saving it in the db
    newUser = await this.usersRepository.save(newUser);

    const link = this.generateLink(newUser.id, newUser.verificationToken!);
    await this.mailService.sendVerificationEmail(newUser.email, link);

    return {
      message:
        "account created successfully, please check your email to verify your account",
    };
  }

  /**
   * Login into the account
   * @param email
   * @param password
   * @returns
   */
  public async login({ email, password }: LoginDto): Promise<object> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("Invalid credentials.");

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched)
      throw new BadRequestException("Invalid credentials.");

    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString("hex");
        const result = await this.usersRepository.save(user);
        verificationToken = result.verificationToken;
      }
      const link = this.generateLink(user.id, verificationToken!);
      await this.mailService.sendVerificationEmail(user.email, link);

      return {
        message:
          "verification email has been sent to your email, please verify your account.",
      };
    }
    const accessToken = await this.usersService.generateJWT({
      id: user.id,
      userType: user.userType,
    });
    return { accessToken };
  }

  /**
   * VERIFY ACCOUNT
   * @param userId
   * @param verificationToken
   * @returns
   */
  public async verifyEmail(
    userId: number,
    verificationToken: string
  ): Promise<object> {
    const user = await this.usersService.getCurrentUser(userId);
    if (user.verificationToken === null)
      throw new BadRequestException("Account already verified.");
    if (user.verificationToken !== verificationToken)
      throw new BadRequestException("Invalid verification token");

    user.isAccountVerified = true;
    user.verificationToken = null;
    await this.usersRepository.save(user);

    return { message: "Account verified successfully, please Log in." };
  }

  /**
   * SEND RESET PASSWORD LINK
   * @param email
   * @returns
   */
  public async sendResetPasswordLink(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("User is not registered.");

    user.resetPasswordToken = randomBytes(32).toString("hex");
    await this.usersRepository.save(user);

    const resetPasswordLink = `${this.config.get<string>(
      "CLIENT_DOMAIN"
    )}/reset-password/${user.id}/${user.resetPasswordToken}`;

    await this.mailService.sendResetPasswordEmail(email, resetPasswordLink);

    return {
      message:
        "reset password email has been sent to your email, please check your email to reset your password.",
    };
  }

  /**
   * CHECK RESET PASSWORD TOKEN
   * @param userId
   * @param token
   * @returns
   */
  public async checkResetPasswordToken(userId: number, token: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found.");
    if (user.resetPasswordToken == null || user.resetPasswordToken !== token)
      throw new BadRequestException("Invalid reset password token");

    return { message: "Valid token, you can reset your password." };
  }

  /**
   * RESET PASSWORD
   * @param userId
   * @param token
   * @param password
   * @returns
   */
  public async resetPassword(dto: ResetPasswordDto) {
    const { newPassword, userId, resetPasswordToken } = dto;

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found.");
    if (
      user.resetPasswordToken == null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException("Invalid reset password token");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await this.usersRepository.save(user);
    return { message: "Password reset successfully, you can login now." };
  }

  /**
   * GENERATE EMAIL VERIFICATION LINK
   * @param userId
   * @param verificationToken
   * @returns
   */
  private generateLink(userId: number, verificationToken: string) {
    const link = `${this.config.get<string>("DOMAIN")}/api/users/auth/verify-email?id=${userId}&token=${verificationToken}`;
    return link;
  }
}

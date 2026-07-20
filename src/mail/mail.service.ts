import { Injectable, RequestTimeoutException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send login email
   * @param username
   * @param email
   */
  public async sendLoginEmail(username: string, email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: `nestProject@test.mailer`,
        subject: `Welcome ${username} to our platform!`,
        template: "login",
        // context vars can be accessed in EJS using <%= %>
        context: {
          username,
          date: today.toDateString(),
          time: today.toLocaleTimeString(),
        },
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Send verification email
   * @param email
   * @param link
   */
  public async sendVerificationEmail(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `nestProject@test.mailer`,
        subject: `Verify your account!`,
        template: "verify-email",
        context: { link },
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Send reset password email
   * @param email
   * @param resetPasswordLink
   */
  public async sendResetPasswordEmail(
    email: string,
    resetPasswordLink: string
  ) {
    try {
      const today = new Date();

      await this.mailerService.sendMail({
        to: email,
        from: `nestProject@test.mailer`,
        subject: `Reset your password!`,
        template: "reset-password",
        context: {
          resetPasswordLink,
          date: today.toDateString(),
          time: today.toLocaleTimeString(),
        },
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new RequestTimeoutException();
    }
  }
}

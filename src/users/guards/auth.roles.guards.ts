import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

import { JWTPayloadType } from "../../utils/types";
import { CURRENT_USER_KEY } from "../../utils/constants";
import { UserTypeEnum } from "../../utils/enums";
import { UsersService } from "../users.service";

// !!!! use only if Roles are Specified !!!!!

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector, // used to get the metadata (roles) from the controller
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    // reflector checks metadata for roles
    const allowedRoles: UserTypeEnum[] = this.reflector.getAllAndOverride(
      "roles",
      [context.getHandler(), context.getClass()]
    );
    if (!allowedRoles || allowedRoles.length === 0) return false; //

    const request: Request = context.switchToHttp().getRequest(); // get the request
    const [type, token] = request.headers.authorization?.split(" ") ?? []; // access the request.headers
    // payload= Bearer + token
    // if token exists + type(=Bearer) then we start de-crypting the token
    if (token && type === "Bearer") {
      try {
        const payload: JWTPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.config.get<string>("JWT_SECRET"),
          }
        );
        const user = await this.usersService.getCurrentUser(payload.id);
        if (!user) throw new UnauthorizedException("User not found.");

        if (allowedRoles.includes(user.userType)) {
          request[CURRENT_USER_KEY] = payload; // like request.user=payload(id+userType)
          return true;
        }
        throw new UnauthorizedException(
          "access denied, insufficient permissions."
        );

        // catch will handle any exception if payload exists but it aint correct
      } catch (error) {
        console.log(error);
        throw new UnauthorizedException("access denied, invalid token.");
      }
      // if token or type are missing, execute the else (returns false)
    } else {
      throw new UnauthorizedException("access denied, no token provided.");
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

import { JWTPayloadType } from "../../utils/types";
import { CURRENT_USER_KEY } from "../../utils/constants";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  // returns ei: true or: flase, if token valid =>true
  async canActivate(context: ExecutionContext) {
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
        request[CURRENT_USER_KEY] = payload; // like request.user=payload(id+userType)
        // catch will handle any exception if payload exists but it aint correct
      } catch (error) {
        console.log(error);
        // return false;
        throw new UnauthorizedException("access denied, invalid token.");
      }
      // if token or type are missing, execute the else (returns false)
    } else {
      throw new UnauthorizedException("access denied, no token provided.");
    }
    return true;
  }
}

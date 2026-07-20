import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { JWTPayloadType } from "../../utils/types";
import { CURRENT_USER_KEY } from "../../utils/constants";

// SIMPLER VERSION (with ESLint warnings):

//Parameter Decorator (to extract the user from the request)
export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest(); // catch the request
    const payload: JWTPayloadType = request[CURRENT_USER_KEY]; // similar to request.user
    return payload; // payload is the user data (id + userType)
  }
);

//I'd recommend using this one in production. The reason the simpler version has ESLint warnings is
//  that data is implicitly any. The typed version explicitly types data: unknown and
//  uses a generic on getRequest<RequestWithUser>() which gives TypeScript full awareness of what's on the request.
//  It's worth the few extra lines.

// Interface to type the Express Request with user property
// interface RequestWithUser {
//   user: JWTPayloadType;
// }

// // Type-safe version (no ESLint warnings)
// export const CurrentUser = createParamDecorator(
//   (data: unknown, context: ExecutionContext): JWTPayloadType => {
//     const request = context.switchToHttp().getRequest<RequestWithUser>();
//     return request.user;
//   }
// );

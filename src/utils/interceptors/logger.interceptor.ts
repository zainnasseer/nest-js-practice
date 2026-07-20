import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { User } from "../../users/user.entity";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    console.log("before route handler..");
    // here you can manipulate the request data, like adding id or role
    return next.handle().pipe(
      map((data: User) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = data; // filter out private fields like password.
        return { ...rest }; // return data without private fields
      })
      // here you can manipulate the response data, like adding id or role
    );
  }
}

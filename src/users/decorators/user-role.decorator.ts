import { SetMetadata } from "@nestjs/common";
import { UserTypeEnum } from "../../utils/enums";

export const Roles = (...roles: UserTypeEnum[]) => SetMetadata("roles", roles);

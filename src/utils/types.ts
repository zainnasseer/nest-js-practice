import { UserTypeEnum } from "./enums";
export type JWTPayloadType = {
  id: number;
  userType: UserTypeEnum;
};

export type AccessTokenType = {
  accessToken: string;
};

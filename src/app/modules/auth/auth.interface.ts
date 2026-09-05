export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  areaId?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IGoogleLogin {
  idToken: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface IRefreshToken {
  refreshToken?: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "TECHNICIAN" | "CUSTOMER";
}

export interface IRefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: "refresh";
}
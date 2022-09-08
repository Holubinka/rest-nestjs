export interface LoginStatus {
  accessToken?: string;
}

export interface RegistrationStatus extends LoginStatus {
  success: boolean;
  message: string;
}

export interface JwtPayload {
  email: string;
}

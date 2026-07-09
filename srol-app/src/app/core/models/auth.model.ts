export type UserRole = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

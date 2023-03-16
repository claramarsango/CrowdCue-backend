import { User } from '../api/users/user-model';

export type LoginRequest = Pick<User, 'email' | 'password'>;

export interface RegisterRequest extends LoginRequest {
  confirmedPassword: string;
}

export interface LoginResponse {
  accessToken: string;
}

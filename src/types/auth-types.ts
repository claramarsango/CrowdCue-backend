import { User } from '../api/users/user-model';

export type AuthRequest = Pick<User, 'email' | 'password'>;

export interface LoginResponse {
  accessToken: string;
}

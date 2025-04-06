import { InferSchema } from '../../../../types';
import { User } from '../models/user.model';
import { loginSchema, registerSchema } from '../validations/auth.validation';

export type CookieOptions = {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none' | undefined;
  secure: boolean;
  path: string;
  maxAge?: number;
};

export interface RegisterDto extends InferSchema<typeof registerSchema> {}
export interface LoginDto extends InferSchema<typeof loginSchema> {}

export type LoginResponse = Pick<User, 'firstName' | 'lastName' | 'email' | 'role'> & { accessToken: string };

export type UserResponse = Omit<User, 'password'>;

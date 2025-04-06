import { JwtPayload } from 'jsonwebtoken';

import { UserRole } from '../../user/interfaces/user.interface';

export type AuthTokenResponse = JwtPayload & {
  accessToken: string;
  id?: string;
  role?: string;
};

export type TokenPayload = JwtPayload & {
  id: string;
  role: UserRole;
};

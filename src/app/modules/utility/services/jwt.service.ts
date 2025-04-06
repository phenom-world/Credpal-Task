import 'dotenv/config';

import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import config from '../../../../config';
import { BadRequestError, ForbiddenError } from '../../../../shared/utils/error.util';
import { AuthTokenResponse, TokenPayload } from '../interfaces/jwt.interface';

export class JWTService {
  static readonly accessTokenExpire = Number(config.application.get('jwt.accessTokenExpiry'));

  static signAccessToken(data: TokenPayload): string {
    return jwt.sign({ id: data.id, role: data.role }, config.application.get('jwt.accessTokenSecret'), {
      expiresIn: this.accessTokenExpire,
    });
  }

  static createSessionToken(user: TokenPayload): AuthTokenResponse {
    const accessToken = this.signAccessToken({ id: user.id, role: user.role });
    return { accessToken };
  }

  static verifyToken(token: string, secret: string): TokenPayload | void {
    try {
      return jwt.verify(token, secret) as TokenPayload;
    } catch (err) {
      this.handleTokenError(err);
    }
  }

  static handleTokenError = (error?: JsonWebTokenError) => {
    if (error?.name === 'TokenExpiredError') {
      throw new ForbiddenError('Token has expired, please login again');
    } else if (error?.name === 'JsonWebTokenError') {
      throw new ForbiddenError('Invalid Token');
    }
    throw new BadRequestError(error?.message!);
  };
}

import { DocumentType } from '@typegoose/typegoose';
import { NextFunction, Request, Response } from 'express';

import config from '../../config';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../../shared/utils/error.util';
import { capitalizeFirst } from '../../shared/utils/string.util';
import { UserRole, UserStatus } from '../modules/user/interfaces/user.interface';
import UserModel, { User } from '../modules/user/models/user.model';
import { TokenPayload } from '../modules/utility/interfaces/jwt.interface';
import { JWTService } from '../modules/utility/services/jwt.service';
import { asyncHandler } from './async-handler.middleware';

interface IAuthMiddleware {
  isAuthenticated: (req: Request, res: Response, next: NextFunction) => void;
  isAuthorized: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
}

class AuthMiddleware implements IAuthMiddleware {
  isAuthenticated = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const token = this.getToken(req);
    if (!token) {
      throw new ForbiddenError('Authorization token is required');
    }
    try {
      const decoded = JWTService.verifyToken(token, config.application.get('jwt.accessTokenSecret')) as TokenPayload;
      if (!decoded.id) {
        throw new UnauthorizedError('Unauthorized to access this route');
      }

      const user = await UserModel.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedError('Unauthorized to access this route');
      }

      if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedError('User account is not active');
      req.user = this.getUser(user);
      next();
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });

  isAuthorized = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!roles.includes(req.user?.role || '')) {
        throw new ForbiddenError(`${capitalizeFirst(req.user?.role.toLowerCase())} is not allowed to access this route`);
      }
      next();
    };
  };

  private getToken(req: Request): string | null {
    const authorization = req.headers.authorization;
    const authToken = req.cookies.authToken;

    if (!authorization && !authToken) {
      return null;
    }
    if (authorization && authorization.startsWith('Bearer')) {
      return authorization.split(' ')[1];
    }
    return authToken;
  }

  private getUser(user: DocumentType<User>) {
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}

export default new AuthMiddleware();

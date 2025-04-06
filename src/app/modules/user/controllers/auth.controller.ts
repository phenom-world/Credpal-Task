import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../../../../shared/utils/helper.util';
import { CustomRequest } from '../../../../types';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { JWTService } from '../../utility/services/jwt.service';
import { cookieOptions } from '../constants/auth.constant';
import { LoginDto, RegisterDto } from '../interfaces/auth.interface';
import AuthService from '../services/auth.service';

class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Register a new user
  registerUser = asyncHandler(async (req: CustomRequest<RegisterDto>, res: Response) => {
    const userData = req.body;
    const response = await this.authService.registerUser(userData);
    return ApiResponse(res, StatusCodes.CREATED, response, 'Account created successfully');
  });

  // Login a user
  loginUser = asyncHandler(async (req: CustomRequest<LoginDto>, res: Response) => {
    const response = await this.authService.loginUser(req.body);
    this.setAuthCookies(res, response?.accessToken!);
    return ApiResponse(res, StatusCodes.OK, response);
  });

  // Change a user's password
  changePassword = asyncHandler(async (req: CustomRequest<{ password: string }>, res: Response) => {
    const userId = req.user.id;
    await this.authService.changePassword(userId, req.body.password);
    return ApiResponse(res, StatusCodes.OK, null, 'Password changed successfully');
  });

  // Logout a user
  logoutUser = async (_req: Request, res: Response) => {
    this.clearAuthCookies(res);
    return ApiResponse(res, StatusCodes.OK, null, 'Logged out successfully');
  };

  // Set authentication cookies
  private setAuthCookies(res: Response, accessToken: string): void {
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: JWTService.accessTokenExpire,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', cookieOptions);
  }
}

export default AuthController;

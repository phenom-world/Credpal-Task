import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import AuthController from '../controllers/auth.controller';
import AuthValidator from '../validations/auth.validation';

class AuthRouter {
  private authController: AuthController;
  private authValidator: AuthValidator;
  private router: Router;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authValidator = new AuthValidator();

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.authValidator.validateRegister, this.authController.registerUser);
    this.router.post('/login', this.authValidator.validateLogin, this.authController.loginUser);
    this.router.post(
      '/change-password',
      authMiddleware.isAuthenticated,
      this.authValidator.validateChangePasswordBody,
      this.authController.changePassword
    );

    this.router.get('/logout', authMiddleware.isAuthenticated, this.authController.logoutUser);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default AuthRouter;

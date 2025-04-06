import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

class AuthValidator {
  validateLogin(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = loginSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateRegister(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = registerSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateChangePasswordBody(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = z
      .object({
        password: z.string().min(5, { message: 'Password must be at least 5 characters' }),
      })
      .safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }
}

export default AuthValidator;

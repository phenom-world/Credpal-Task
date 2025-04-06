import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';
import { sanitize } from '../../../../shared/utils/helper.util';

export const createsavingsSchema = z.object({
  amount: z.number().positive(),
  savingGoalId: z.string().regex(/^[0-9a-f]{24}$/, {
    message: 'Invalid saving goal ID format.',
  }),
});

export const getAllSavingsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  savingGoalId: z
    .string()
    .regex(/^[0-9a-f]{24}$/, {
      message: 'Invalid saving goal ID format.',
    })
    .optional(),
});

export const updatesavingsSchema = createsavingsSchema.partial();

class SavingsValidator {
  validateCreatesavings(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = createsavingsSchema.safeParse(data);
    req.body = sanitize(response.data);
    return validate(response, next);
  }

  validateUpdatesavings(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = updatesavingsSchema.safeParse(data);
    req.body = sanitize(response.data);
    return validate(response, next);
  }

  validateGetAllSavings(req: Request, _res: Response, next: NextFunction) {
    const data = req.query;
    const response = getAllSavingsQuerySchema.safeParse(data);
    req.query = sanitize({
      ...response.data,
      savingGoalId: response.data?.savingGoalId?.toString(),
    });
    return validate(response, next);
  }
}

export default SavingsValidator;

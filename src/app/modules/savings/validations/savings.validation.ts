import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';
import { sanitize } from '../../../../shared/utils/helper.util';
import { SavingsStatus, SavingsType } from '../interfaces/savings.interface';

export const createsavingsSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(SavingsType),
  startDate: z.date(),
  endDate: z.date().optional(),
});

export const getAllSavingsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(SavingsStatus).optional(),
  type: z.nativeEnum(SavingsType).optional(),
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
    req.query = sanitize(response.data);
    return validate(response, next);
  }
}

export default SavingsValidator;

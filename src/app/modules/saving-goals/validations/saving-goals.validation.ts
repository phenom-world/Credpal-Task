import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';
import { sanitize } from '../../../../shared/utils/helper.util';
import { SavingsStatus, SavingsType } from '../interfaces/savings.interface';

// Date validation helpers
const isFutureDate = (date: string) => {
  const inputDate = new Date(date);
  const today = new Date();
  return inputDate > today;
};

const validateDateRange = (startDate?: string, targetDate?: string) => {
  if (startDate && targetDate) {
    return new Date(startDate) < new Date(targetDate);
  }
  return true;
};

// Base schema
const baseSavingGoalsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  type: z.nativeEnum(SavingsType),
  status: z.nativeEnum(SavingsStatus).default(SavingsStatus.ACTIVE),
  description: z.string().optional(),
  targetDate: z.string().datetime('Invalid target date format').refine(isFutureDate, { message: 'Target date must be in the future' }).optional(),
  startDate: z.string().datetime('Invalid start date format').refine(isFutureDate, { message: 'Start date must be in the future' }).optional(),
});

// Create schema
export const createSavingGoalsSchema = baseSavingGoalsSchema.refine((data) => validateDateRange(data.startDate, data.targetDate), {
  message: 'Start date must be before target date',
  path: ['startDate'],
});

// Query schema
export const getAllSavingGoalsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(SavingsStatus).optional(),
  type: z.nativeEnum(SavingsType).optional(),
});

// Update schema
export const updateSavingGoalsSchema = baseSavingGoalsSchema
  .partial()
  .refine((data) => validateDateRange(data.startDate, data.targetDate), { message: 'Start date must be before target date', path: ['startDate'] });

class SavingGoalsValidator {
  validateCreateSavingGoals(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = createSavingGoalsSchema.safeParse(data);
    req.body = sanitize(response.data);
    return validate(response, next);
  }

  validateUpdateSavingGoals(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = updateSavingGoalsSchema.safeParse(data);
    req.body = sanitize(response.data);
    return validate(response, next);
  }

  validateGetAllSavingGoals(req: Request, _res: Response, next: NextFunction) {
    const data = req.query;
    const response = getAllSavingGoalsQuerySchema.safeParse(data);
    req.query = sanitize(response.data);
    return validate(response, next);
  }
}

export default SavingGoalsValidator;

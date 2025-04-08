import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';
import { sanitize } from '../../../../shared/utils/helper.util';
import { dateSchema } from '../../utility/validators/schema/date.validator';
import { DebitType } from '../interfaces/invoice.interface';

// Invoice Validations
export const createInvoiceSchema = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/, {
    message: 'Invalid user ID format.',
  }),
  amount: z.number().positive('Amount must be greater than 0'),
  debitType: z.nativeEnum(DebitType),
  dueAt: dateSchema,
  savingGoalId: z
    .string()
    .regex(/^[0-9a-f]{24}$/, {
      message: 'Invalid saving goal ID format.',
    })
    .optional(),
  memo: z.string().min(1, 'Memo is required'),
});

export const getUserInvoicesSchema = z.object({
  startAt: dateSchema.optional(),
  endAt: dateSchema.optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export class InvoiceValidator {
  validateCreateInvoice(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = createInvoiceSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateGetUserInvoicesQuery(req: Request, _res: Response, next: NextFunction) {
    const data = req.query;
    const response = getUserInvoicesSchema.safeParse(data);
    req.query = sanitize(response.data);
    return validate(response, next);
  }
}

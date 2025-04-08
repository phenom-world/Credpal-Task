import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';
import { sanitize, validateFields } from '../../../../shared/utils/helper.util';
import { ObjectData } from '../../../../types';
import { Currency } from '../../utility/interfaces/payment.interface';
import { dateSchema } from '../../utility/validators/schema/date.validator';
import { PaymentActionType, PaymentProvider } from '../interfaces/payment.interface';

export const initializePaymentSchema = z
  .object({
    provider: z.nativeEnum(PaymentProvider),
    type: z.nativeEnum(PaymentActionType).optional(),
    amount: z.number().optional(),
    memo: z.string().optional(),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
    name: z.string().optional(),
    billingAddress: z
      .object({
        addressLine1: z.string().min(1, 'Address line 1 is required'),
        addressLine2: z.string().optional(),
        adminArea1: z.string().min(1, 'Admin area 1 is required'),
        city: z.string().min(1, 'City is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        countryCode: z.string().min(1, 'Country code is required'),
      })
      .optional(),
  })
  .superRefine((data: ObjectData, ctx) => {
    if (data.provider === PaymentProvider.PAYPAL) {
      const requiredFields = [
        { field: 'name', message: 'Name is required' },
        { field: 'billingAddress', message: 'Billing address is required' },
        { field: 'type', message: 'Action type (add_card or add_paypal) is required for PayPal' },
      ];
      validateFields(requiredFields, data, ctx);

      // Validate card details if adding a card
      if (data.type === PaymentActionType.ADD_CARD) {
        const requiredFields = [
          { field: 'cardNumber', message: 'Card number is required' },
          { field: 'expiry', message: 'Expiry is required' },
          { field: 'cvv', message: 'CVV is required' },
        ];
        validateFields(requiredFields, data, ctx);
      }
    }
    // Validate Paystack specific requirements
    if (data.provider === PaymentProvider.PAYSTACK && data.type === PaymentActionType.ADD_PAYPAL) {
      const requiredFields = [{ field: 'type', message: 'PayPal integration is not supported for this provider' }];
      validateFields(requiredFields, data, ctx);
    }

    // Amount is required for non-type transactions
    if (!data.type && !data.amount) {
      const requiredFields = [{ field: 'amount', message: 'Amount is required for payment transactions' }];
      validateFields(requiredFields, data, ctx);
    }
  });

export const verifyTransactionSchema = z.object({
  reference: z.string(),
  type: z.nativeEnum(PaymentActionType).optional(),
  provider: z.nativeEnum(PaymentProvider),
});

export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.nativeEnum(Currency).default(Currency.USD),
  invoiceId: z.string().regex(/^[0-9a-f]{24}$/, {
    message: 'Invalid invoice ID format.',
  }),
  reference: z.string().min(1, 'Transaction reference is required'),
  metadata: z.record(z.string(), z.any()).optional(),
  provider: z.nativeEnum(PaymentProvider),
});

export const getAllPaymentsSchema = z.object({
  startAt: dateSchema.optional(),
  endAt: dateSchema.optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive('Refund amount must be greater than 0'),
  reason: z.string().min(1, 'Refund reason is required'),
});

export const settlePaymentsSchema = z.object({
  references: z.array(z.string()).min(1, 'References are required'),
});

export class PaymentValidator {
  validateInitializePayment(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = initializePaymentSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateCreatePayment(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = createPaymentSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateRefundPayment(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = refundPaymentSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateGetAllPaymentsQuery(req: Request, _res: Response, next: NextFunction) {
    const data = req.query;
    const response = getAllPaymentsSchema.safeParse(data);
    req.query = sanitize(response.data);
    return validate(response, next);
  }

  validateVerifyTransaction(req: Request, _res: Response, next: NextFunction) {
    const data = req.query;
    const response = verifyTransactionSchema.safeParse(data);
    req.query = sanitize(response.data);
    return validate(response, next);
  }
}

import { Document } from 'mongoose';

import { InferSchema } from '../../../../types';
import { Payment as TransactionModel } from '../models/payment.model';
import {
  createPaymentSchema,
  getAllPaymentsSchema,
  initializePaymentSchema,
  refundPaymentSchema,
  settlePaymentsSchema,
  verifyTransactionSchema,
} from '../validations/payment.validation';

export type CreatePaymentDto = InferSchema<typeof createPaymentSchema>;
export type InitializePaymentDto = InferSchema<typeof initializePaymentSchema>;
export type VerifyTransactionDto = InferSchema<typeof verifyTransactionSchema>;
export type GetAllPaymentsQuery = InferSchema<typeof getAllPaymentsSchema>;
export type RefundPaymentDto = InferSchema<typeof refundPaymentSchema>;
export type SettlePaymentsDto = InferSchema<typeof settlePaymentsSchema>;

export type TransactionResponse = Document & TransactionModel;

export interface BillingAddress {
  addressLine1: string;
  addressLine2?: string;
  adminArea1: string;
  city: string;
  postalCode: string;
  countryCode: string;
}

export type PaymentMethodDto = {
  last4: string;
  accountName?: string;
  authorizationCode?: string;
  signature?: string;
  bank?: string;
  bin?: string;
  cardType: string;
  expMonth: number;
  expYear: number;
  preferred?: boolean;
  provider: PaymentProvider;
  billingAddress?: BillingAddress;
};

export enum PaymentActionType {
  ADD_CARD = 'add_card',
  ADD_PAYPAL = 'add_paypal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentProvider {
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave',
  PAYPAL = 'paypal',
}

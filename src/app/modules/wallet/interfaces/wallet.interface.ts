import { z } from 'zod';

import { Currency } from '../../utility/interfaces/payment.interface';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TransactionCategory {
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
}

// Base schema for wallet transactions
const baseTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.nativeEnum(Currency),
  description: z.string().optional(),
  category: z.nativeEnum(TransactionCategory),
  metadata: z.record(z.any()).optional(),
});

// Create transaction schema
export const createTransactionSchema = baseTransactionSchema.extend({
  type: z.nativeEnum(TransactionType),
  recipientId: z.string().optional(),
});

// Query schema for transactions
export const getTransactionsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

// Wallet balance interface
export interface WalletBalance {
  available: number;
  currency: Currency;
}

// Transaction interfaces
export interface CreateTransactionDto extends z.infer<typeof createTransactionSchema> {}
export interface GetTransactionsQuery extends z.infer<typeof getTransactionsQuerySchema> {}

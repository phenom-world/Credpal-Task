import { InferSchema, MongoObjectId } from '../../../../types';
import { createInvoiceSchema, getUserInvoicesSchema } from '../validations/invoice.validator';

export type CreateInvoiceDto = Omit<InferSchema<typeof createInvoiceSchema>, 'userId' | 'savingGoalId'> & {
  userId: MongoObjectId;
  savingGoalId?: MongoObjectId;
};
export type GetUserInvoicesQuery = InferSchema<typeof getUserInvoicesSchema>;

export enum DebitType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

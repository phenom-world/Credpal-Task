import { InferSchema } from '../../../../types';
import { createsavingsSchema, getAllSavingsQuerySchema, updatesavingsSchema } from '../validations/savings.validation';

export enum SavingsStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SavingsType {
  EMERGENCY = 'emergency',
  RETIREMENT = 'retirement',
  EDUCATION = 'education',
  VACATION = 'vacation',
  GENERAL = 'general',
}
export interface CreateSavingsDto extends InferSchema<typeof createsavingsSchema> {}
export interface UpdateSavingsDto extends InferSchema<typeof updatesavingsSchema> {}
export interface GetAllSavingsQuery extends InferSchema<typeof getAllSavingsQuerySchema> {}

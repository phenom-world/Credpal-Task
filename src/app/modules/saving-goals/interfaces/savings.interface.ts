import { InferSchema } from '../../../../types';
import { createSavingGoalsSchema, getAllSavingGoalsQuerySchema, updateSavingGoalsSchema } from '../validations/saving-goals.validation';

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
export interface CreateSavingGoalsDto extends Omit<InferSchema<typeof createSavingGoalsSchema>, 'targetDate' | 'startDate'> {
  targetDate?: Date;
  startDate?: Date;
}
export interface UpdateSavingGoalsDto extends Omit<InferSchema<typeof updateSavingGoalsSchema>, 'targetDate' | 'startDate'> {
  targetDate?: Date;
  startDate?: Date;
}
export interface GetAllSavingGoalsQuery extends InferSchema<typeof getAllSavingGoalsQuerySchema> {}

import { InferSchema, MongoObjectId } from '../../../../types';
import { createsavingsSchema, getAllSavingsQuerySchema, updatesavingsSchema } from '../validations/savings.validation';

export interface CreateSavingsDto extends Omit<InferSchema<typeof createsavingsSchema>, 'savingGoalId'> {
  savingGoalId: MongoObjectId;
}

export interface UpdateSavingsDto extends InferSchema<typeof updatesavingsSchema> {}
export interface GetAllSavingsQuery extends InferSchema<typeof getAllSavingsQuerySchema> {}

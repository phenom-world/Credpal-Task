import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';

@modelOptions(schemaOptions)
export class Savings {
  @prop({ required: true, min: 0 })
  amount!: number;

  @prop({ required: true, ref: 'SavingGoal' })
  savingGoalId!: Types.ObjectId;
}

const SavingsModel = getModelForClass(Savings);
export default SavingsModel;

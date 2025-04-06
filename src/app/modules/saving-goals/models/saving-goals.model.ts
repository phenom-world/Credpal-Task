import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { SavingsStatus, SavingsType } from '../interfaces/savings.interface';

@modelOptions(schemaOptions)
export class SavingGoal {
  @prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId!: mongoose.Types.ObjectId;

  @prop({ required: true, min: 0 })
  targetAmount!: number;

  @prop({ required: true, min: 0, default: 0 })
  amountSaved!: number;

  @prop({ required: true, enum: SavingsType, type: String })
  type!: SavingsType;

  @prop({ required: true, enum: SavingsStatus, type: String, default: SavingsStatus.ACTIVE })
  status!: SavingsStatus;

  @prop({ required: true })
  name!: string;

  @prop()
  description?: string;

  @prop({ required: true })
  targetDate!: Date;

  @prop({ required: true })
  startDate!: Date;
}

const SavingGoalModel = getModelForClass(SavingGoal);
export default SavingGoalModel;

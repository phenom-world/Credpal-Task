import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { SavingsStatus, SavingsType } from '../interfaces/savings.interface';

@modelOptions(schemaOptions)
export class Savings {
  @prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId!: mongoose.Types.ObjectId;

  @prop({ required: true, min: 0 })
  amount!: number;

  @prop({ required: true, enum: SavingsType, type: String })
  type!: SavingsType;

  @prop({ required: true, enum: SavingsStatus, type: String, default: SavingsStatus.ACTIVE })
  status!: SavingsStatus;

  @prop({ required: true, min: 0 })
  savingsGoal!: number;

  @prop({ required: true })
  startDate!: Date;

  @prop()
  endDate?: Date;

  @prop({ min: 0 })
  returns?: number;
}

const SavingsModel = getModelForClass(Savings);
export default SavingsModel;

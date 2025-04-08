import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { Currency, RecurringInterval } from '../../utility/interfaces/payment.interface';
import { SavingsStatus, SavingsType } from '../interfaces/savings.interface';

@modelOptions(schemaOptions)
export class SavingGoal extends TimeStamps {
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

  @prop({ required: true, default: false })
  isRecurring!: boolean;

  @prop({ required: true, default: 0 })
  recurringAmount!: number;

  @prop({ required: true, enum: RecurringInterval, type: String })
  recurringInterval!: RecurringInterval;

  @prop({ required: true, default: 0 })
  recurringCount!: number;

  @prop()
  nextRecurringDate?: Date;

  @prop({ required: true, enum: Currency, type: String })
  currency!: Currency;

  @prop({ required: true })
  targetDate!: Date;

  @prop({ required: true })
  startDate!: Date;
}

const SavingGoalModel = getModelForClass(SavingGoal);
export default SavingGoalModel;

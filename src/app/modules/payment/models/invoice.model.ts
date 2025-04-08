import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { DebitType } from '../interfaces/invoice.interface';

@modelOptions(schemaOptions)
export class Invoice extends TimeStamps {
  @prop({ required: true, ref: 'User' })
  userId!: Ref<mongoose.Types.ObjectId>;

  @prop({ required: true, min: 0, default: 0 })
  amount!: number;

  @prop({ required: true, enum: DebitType, type: String })
  debitType!: DebitType;

  @prop({ required: true, min: 0, default: 0 })
  totalPaid!: number;

  @prop({ required: true, min: 0, default: 0 })
  amountRefunded!: number;

  @prop({ required: true, min: 0, default: 0 })
  processingAmount!: number;

  @prop({ required: true, default: 0 })
  chargeAttempt!: number;

  @prop({ required: true })
  dueAt!: Date;

  @prop({ required: true, default: false })
  isVoid!: boolean;

  @prop({ ref: 'SavingGoal' })
  savingGoalId?: Ref<mongoose.Types.ObjectId>;

  @prop()
  memo?: string;
}

const InvoiceModel = getModelForClass(Invoice);
export default InvoiceModel;

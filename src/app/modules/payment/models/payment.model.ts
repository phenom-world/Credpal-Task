import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { Currency } from '../../utility/interfaces/payment.interface';
import { PaymentProvider, TransactionStatus } from '../interfaces/payment.interface';

@modelOptions(schemaOptions)
export class Payment extends TimeStamps {
  @prop({ required: true, min: 0 })
  amount!: number;

  @prop({ required: true, enum: Currency, type: String, default: Currency.USD })
  currency!: Currency;

  @prop({ required: true, enum: PaymentProvider, type: String, default: PaymentProvider.PAYSTACK })
  provider!: PaymentProvider;

  @prop({ required: true, unique: true })
  reference!: string;

  @prop()
  refundReference?: string;

  @prop({ required: true, ref: 'Invoice' })
  invoiceId!: Ref<mongoose.Types.ObjectId>;

  @prop({ required: true, enum: TransactionStatus, type: String, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @prop()
  refundAt?: Date;

  @prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Object;

  @prop()
  deletedAt?: Date;

  @prop({ required: true, default: Date.now })
  createdAt!: Date;

  @prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

const PaymentModel = getModelForClass(Payment);

export { PaymentModel };

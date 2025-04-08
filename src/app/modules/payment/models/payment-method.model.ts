import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { PaymentProvider } from '../interfaces/payment.interface';

@modelOptions(schemaOptions)
export class PaymentMethod extends TimeStamps {
  @prop({ required: true, ref: 'User' })
  userId!: Ref<mongoose.Types.ObjectId>;

  @prop({ required: true })
  last4!: string;

  @prop()
  accountName?: string;

  @prop({ unique: true })
  authorizationCode?: string;

  @prop()
  signature?: string;

  @prop()
  bank?: string;

  @prop()
  bin?: string;

  @prop({ required: true })
  cardType!: string;

  @prop({ type: Object })
  billingAddress?: object;

  @prop({ required: true })
  expMonth!: number;

  @prop({ required: true })
  expYear!: number;

  @prop({ required: true, default: false })
  preferred!: boolean;

  @prop({ required: true, enum: PaymentProvider, type: String })
  provider!: PaymentProvider;
}

const PaymentMethodModel = getModelForClass(PaymentMethod);

export { PaymentMethodModel };

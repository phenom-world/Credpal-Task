import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

import { schemaOptions } from '../../utility/constants/schema.contants';
import { Currency } from '../../utility/interfaces/payment.interface';
import { TransactionCategory, TransactionStatus, TransactionType } from '../interfaces/wallet.interface';

@modelOptions(schemaOptions)
export class Wallet extends TimeStamps {
  @prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId!: Ref<mongoose.Types.ObjectId>;

  @prop({ required: true, min: 0, default: 0 })
  balance!: number;

  @prop({ required: true, enum: Currency, type: String })
  currency!: Currency;

  @prop({ required: true, default: true })
  isActive!: boolean;
}

@modelOptions(schemaOptions)
export class WalletTransaction extends TimeStamps {
  @prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId!: mongoose.Types.ObjectId;

  @prop({ required: true, min: 0 })
  amount!: number;

  @prop({ required: true, enum: TransactionType, type: String })
  type!: TransactionType;

  @prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' })
  paymentMethodId!: Ref<mongoose.Types.ObjectId>;

  @prop({ required: true, enum: TransactionCategory, type: String })
  category!: TransactionCategory;

  @prop({ required: true, enum: TransactionStatus, type: String, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @prop({ required: true, enum: Currency, type: String })
  currency!: Currency;

  @prop({ type: Object })
  metadata?: object;
}

const WalletModel = getModelForClass(Wallet);
const WalletTransactionModel = getModelForClass(WalletTransaction);

export { WalletModel, WalletTransactionModel };

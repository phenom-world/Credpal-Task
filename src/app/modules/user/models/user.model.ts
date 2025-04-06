import { getModelForClass, index, modelOptions, pre, prop } from '@typegoose/typegoose';

import encrypterUtil from '../../../../shared/utils/encrypter.util';
import { schemaOptions } from '../../utility/constants/schema.contants';
import { emailValidator, passwordValidator } from '../../utility/validators/schema/user.validator';
import { UserRole, UserStatus } from '../interfaces/user.interface';

@pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await encrypterUtil.hash(this.password);
  next();
})
@modelOptions(schemaOptions)
@index({ email: 1 }, { unique: true })
export class User {
  @prop({ required: true, validate: emailValidator })
  email!: string;

  @prop({ required: true, select: false, validate: passwordValidator })
  password!: string;

  @prop()
  firstName?: string;

  @prop()
  lastName?: string;

  @prop({ enum: UserStatus, type: String, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @prop()
  lastLoginAt?: Date;

  @prop({ enum: UserRole, type: String, default: UserRole.USER })
  role!: UserRole;

  @prop()
  deletedAt?: Date;

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return encrypterUtil.compare(enteredPassword, this.password);
  }
}

const UserModel = getModelForClass(User);
export default UserModel;

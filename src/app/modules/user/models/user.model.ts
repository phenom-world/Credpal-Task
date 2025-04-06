import { getModelForClass, index, modelOptions, pre, prop } from '@typegoose/typegoose';

import encrypterUtil from '../../../../shared/utils/encrypter.util';
import { UserRole, UserStatus } from '../interfaces/user.interface';

@pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await encrypterUtil.hash(this.password);
  next();
})
@modelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
})
@index({ email: 1 }, { unique: true })
export class User {
  @prop({
    required: true,
    validate: {
      validator: (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address',
    },
  })
  email!: string;

  @prop({
    required: true,
    select: false,
    validate: {
      validator: (password: string) => {
        return password.length >= 8;
      },
      message: 'Password must be at least 8 characters long',
    },
  })
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

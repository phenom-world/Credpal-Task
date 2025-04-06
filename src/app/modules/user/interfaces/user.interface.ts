import { InferSchema } from '../../../../types';
import { getAllUsersQuerySchema } from '../validations/user.validation';

export type GetAllUsersQuery = InferSchema<typeof getAllUsersQuerySchema>;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

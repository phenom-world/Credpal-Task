import { FilterQuery } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { sanitize } from '../../../../shared/utils/helper.util';
import { MongoObjectId, Paginate } from '../../../../types';
import { GetAllUsersQuery, UserStatus } from '../interfaces/user.interface';
import UserModel, { User } from '../models/user.model';
class UserService {
  private readonly repo: Repository<User>;

  constructor() {
    this.repo = new Repository(UserModel);
  }

  async getAllUsers(paginate: Paginate, query: GetAllUsersQuery): Promise<{ count: number; records: User[] }> {
    const { limit, offset } = paginate;
    const { search, status } = query;

    const filter: FilterQuery<User> = sanitize({ status: status ?? UserStatus.ACTIVE });

    if (search) {
      Object.assign(filter, { $or: [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }] });
    }

    return await this.repo.findAndCountAll(filter, {
      skip: offset,
      limit,
    });
  }

  async getUser(userId: MongoObjectId): Promise<User> {
    return await this.repo.findOneOrThrow({ _id: userId });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repo.delete({ _id: userId });
  }
}

export default UserService;

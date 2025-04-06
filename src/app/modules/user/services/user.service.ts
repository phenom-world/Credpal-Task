import { FilterQuery } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { Paginate } from '../../../../types';
import { GetAllUsersQuery, UserRole, UserStatus } from '../interfaces/user.interface';
import UserModel, { User } from '../models/user.model';

class UserService {
  private readonly repo: Repository<User>;

  constructor() {
    this.repo = new Repository(UserModel);
  }

  async getAllUsers(paginate: Paginate, query: GetAllUsersQuery) {
    const { limit, offset } = paginate;
    const { search, status } = query;

    const filter: FilterQuery<User> = { role: UserRole.USER, status: status ?? UserStatus.ACTIVE };

    if (search) {
      Object.assign(filter, { $or: [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }] });
    }

    return await this.repo.findAndCountAll(filter, {
      skip: offset,
      limit,
    });
  }

  async getUser(userId: string) {
    const user = await this.repo.findOneOrThrow({ _id: userId });
    return user;
  }
}

export default UserService;

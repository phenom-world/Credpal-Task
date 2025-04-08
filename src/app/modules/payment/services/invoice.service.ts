import { FilterQuery, QueryOptions, Types } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { MongoObjectId, Paginate } from '../../../../types';
import SavingGoalModel, { SavingGoal } from '../../saving-goals/models/saving-goals.model';
import UserModel, { User } from '../../user/models/user.model';
import { CreateInvoiceDto, GetUserInvoicesQuery } from '../interfaces/invoice.interface';
import InvoiceModel, { Invoice } from '../models/invoice.model';

export class InvoiceService {
  private readonly repo: Repository<Invoice>;
  private readonly userRepo: Repository<User>;
  private readonly savingGoalRepo: Repository<SavingGoal>;

  constructor() {
    this.repo = new Repository(InvoiceModel);
    this.savingGoalRepo = new Repository(SavingGoalModel);
    this.userRepo = new Repository(UserModel);
  }

  async createInvoice(data: CreateInvoiceDto) {
    const userId = new Types.ObjectId(data.userId);
    await this.userRepo.findOneOrThrow({ _id: userId });

    // If savingGoalId is provided, verify it exists
    if (data?.savingGoalId) {
      const savingGoalId = new Types.ObjectId(data.savingGoalId);
      await this.savingGoalRepo.findOneOrThrow({ _id: savingGoalId });
    }

    return this.repo.create({
      data: {
        userId: new Types.ObjectId(data.userId),
        amount: data.amount,
        debitType: data.debitType,
        dueAt: new Date(data.dueAt),
        ...(data.savingGoalId ? { savingGoalId: new Types.ObjectId(data.savingGoalId) } : {}),
        memo: data.memo,
      },
    });
  }

  async getUserInvoices(paginate: Paginate, query: GetUserInvoicesQuery, userId: MongoObjectId) {
    const { startAt, endAt } = query;
    const { limit, offset } = paginate;
    const filter: FilterQuery<Invoice> = {
      userId,
      ...(startAt || endAt ? { createdAt: { ...(startAt ? { $gte: new Date(startAt) } : {}), ...(endAt ? { $lte: new Date(endAt) } : {}) } } : {}),
    };

    const options: QueryOptions<Invoice> = {
      skip: offset,
      limit,
      sort: { createdAt: -1 },
      populate: 'savingGoal',
    };

    return await this.repo.findAndCountAll(filter, options);
  }

  async getInvoice(id: string) {
    const options: QueryOptions<Invoice> = {
      populate: ['savingGoal'],
    };
    return this.repo.findOneOrThrow({ _id: new Types.ObjectId(id) }, { options });
  }

  async voidInvoice(id: string) {
    return this.repo.update({ _id: new Types.ObjectId(id) }, { data: { isVoid: true } });
  }
}

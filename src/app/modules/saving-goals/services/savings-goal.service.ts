import { FilterQuery } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { sanitize } from '../../../../shared/utils/helper.util';
import { MongoObjectId, Paginate } from '../../../../types';
import { CreateSavingGoalsDto, GetAllSavingGoalsQuery, UpdateSavingGoalsDto } from '../interfaces/savings.interface';
import SavingGoalModel, { SavingGoal } from '../models/saving-goals.model';

export class SavingsService {
  private readonly repo: Repository<SavingGoal>;

  constructor() {
    this.repo = new Repository(SavingGoalModel);
  }

  async create(userId: MongoObjectId, savingsData: CreateSavingGoalsDto): Promise<SavingGoal> {
    return await this.repo.create({ data: { ...savingsData, userId } });
  }

  async update(id: string, userId: MongoObjectId, updateData: UpdateSavingGoalsDto): Promise<SavingGoal | null> {
    return await this.repo.update({ _id: id, userId }, { data: updateData });
  }

  async getAllSavings(paginate: Paginate, query: GetAllSavingGoalsQuery, userId: MongoObjectId): Promise<{ count: number; records: SavingGoal[] }> {
    const { limit, offset } = paginate;
    const { search, status, type } = query;

    const filter: FilterQuery<SavingGoal> = sanitize({ status, type, userId });

    if (search) {
      Object.assign(filter, { $or: [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }] });
    }

    return await this.repo.findAndCountAll(filter, {
      skip: offset,
      limit,
    });
  }

  async getOneSavings(id: string, userId: MongoObjectId): Promise<SavingGoal> {
    return await this.repo.findOneOrThrow({ _id: id, userId });
  }

  async delete(id: string, userId: MongoObjectId): Promise<void> {
    await this.repo.delete({ _id: id, userId });
  }
}

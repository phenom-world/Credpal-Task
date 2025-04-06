import { FilterQuery } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { sanitize } from '../../../../shared/utils/helper.util';
import { MongoObjectId, Paginate } from '../../../../types';
import { CreateSavingsDto, GetAllSavingsQuery, UpdateSavingsDto } from '../interfaces/savings.interface';
import SavingsModel, { Savings } from '../models/savings.model';
export class SavingsService {
  private readonly repo: Repository<Savings>;

  constructor() {
    this.repo = new Repository(SavingsModel);
  }

  async create(userId: MongoObjectId, savingsData: CreateSavingsDto): Promise<Savings> {
    return await this.repo.create({ data: { ...savingsData, userId } });
  }

  async update(id: string, userId: MongoObjectId, updateData: UpdateSavingsDto): Promise<Savings | null> {
    return await this.repo.update({ _id: id, userId }, { data: updateData });
  }

  async getAllSavings(paginate: Paginate, query: GetAllSavingsQuery, userId: MongoObjectId): Promise<{ count: number; records: Savings[] }> {
    const { limit, offset } = paginate;
    const { search, status, type } = query;

    const filter: FilterQuery<Savings> = sanitize({ status, type, userId });

    if (search) {
      Object.assign(filter, { $or: [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }] });
    }

    return await this.repo.findAndCountAll(filter, {
      skip: offset,
      limit,
    });
  }

  async getOneSavings(id: string, userId: MongoObjectId): Promise<Savings> {
    return await this.repo.findOneOrThrow({ _id: id, userId });
  }

  async delete(id: string, userId: MongoObjectId): Promise<void> {
    await this.repo.delete({ _id: id, userId });
  }
}

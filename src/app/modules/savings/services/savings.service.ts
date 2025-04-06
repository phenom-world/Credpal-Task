import { Repository } from '../../../../shared/utils/data-repo.util';
import { CreateSavingsDto } from '../interfaces/savings.interface';
import SavingsModel, { Savings } from '../models/savings.model';

export class SavingsService {
  private readonly repo: Repository<Savings>;

  constructor() {
    this.repo = new Repository(SavingsModel);
  }

  async create(savingsData: CreateSavingsDto): Promise<Savings> {
    return await this.repo.create({ data: savingsData });
  }

  async update(id: string, updateData: Partial<Savings>): Promise<Savings | null> {
    return await this.repo.update(id, { ...updateData, updatedAt: new Date() }, { new: true });
  }

  async getAll(): Promise<Savings[]> {
    return await this.repo.find();
  }
  async getOne(id: string): Promise<Savings | null> {
    return await this.repo.findOneOrThrow({ _id: id });
  }

  async delete(id: string): Promise<Savings | null> {
    return await this.repo.delete({ _id: id });
  }
}

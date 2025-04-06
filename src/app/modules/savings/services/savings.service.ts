import { PipelineStage } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { MongoObjectId, Paginate } from '../../../../types';
import eventsService from '../../utility/services/events.service';
import { CreateSavingsDto, GetAllSavingsQuery, UpdateSavingsDto } from '../interfaces/savings.interface';
import SavingsModel, { Savings } from '../models/savings.model';

export class SavingsService {
  private readonly repo: Repository<Savings>;

  constructor() {
    this.repo = new Repository(SavingsModel);
  }

  async create(savingsData: CreateSavingsDto): Promise<Savings> {
    const savings = await this.repo.create({ data: { ...savingsData, savingGoalId: savingsData.savingGoalId } });
    eventsService.emit('savings.created', JSON.stringify({ amount: savingsData.amount, savingGoalId: savingsData.savingGoalId }));
    return savings;
  }

  async update(id: string, updateData: UpdateSavingsDto): Promise<Savings | null> {
    const savings = await this.repo.findOneOrThrow({ _id: id });
    const updatedSavings = await this.repo.update({ _id: id }, { data: updateData });

    if (updateData.amount !== savings.amount) {
      eventsService.emit(
        'savings.updated',
        JSON.stringify({ amount: updateData.amount, previousAmount: savings.amount, savingGoalId: savings.savingGoalId })
      );
    }
    return updatedSavings;
  }

  async getAllSavings(paginate: Paginate, query: GetAllSavingsQuery, userId: MongoObjectId): Promise<{ count: number; records: Savings[] }> {
    const { limit, offset } = paginate;
    const { savingGoalId } = query;

    const projectPipeline = [{ $project: { createdAt: 0, updatedAt: 0, __v: 0 } }];

    const matchStage1 = { $match: { ...(savingGoalId && { savingGoalId }) } };
    const matchStage2 = { $match: { 'savingGoal.userId': userId } };

    const pipeline: PipelineStage[] = [
      matchStage1,
      { $lookup: { from: 'savinggoals', localField: 'savingGoalId', foreignField: '_id', as: 'savingGoal', pipeline: projectPipeline } },
      { $unwind: '$savingGoal' },
      matchStage2,
      //replace _id with id
      { $addFields: { id: '$_id', 'savingGoal.id': '$savingGoal._id' } },
      { $project: { _id: 0, 'savingGoal._id': 0 } },
      // sort by createdAt
      { $sort: { createdAt: -1 } },
      // Facet for pagination + count
      { $facet: { records: [{ $skip: offset }, { $limit: Number(limit) }], metadata: [{ $count: 'total' }] } },
      { $project: { records: 1, total: { $arrayElemAt: ['$metadata.total', 0] } } },
    ];
    const result = await this.repo.aggregate(pipeline);

    const records = result[0]?.records || [];
    const count = result[0]?.total || 0;
    return { count, records };
  }

  async getOneSavings(id: string) {
    return await this.repo.findOneOrThrow({ _id: id });
  }

  async delete(id: string): Promise<void> {
    const savings = await this.repo.findOneOrThrow({ _id: id });
    await this.repo.delete({ _id: id });
    eventsService.emit('savings.deleted', JSON.stringify({ amount: savings.amount, savingGoalId: savings.savingGoalId }));
  }
}

import { ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor, BeAnObject } from '@typegoose/typegoose/lib/types';
import { FilterQuery, PipelineStage, QueryOptions, UpdateQuery } from 'mongoose';

import { BadRequestError, NotFoundError } from './error.util';
import { capitalizeFirst } from './string.util';

export class Repository<T> {
  constructor(private readonly model: ReturnModelType<AnyParamConstructor<T>, BeAnObject>) {}

  async findById(id: string, options?: QueryOptions<T>) {
    return this.model.findById(id, null, options).exec();
  }

  async findAndCountAll(query: FilterQuery<T>, options?: QueryOptions<T>) {
    const [count, records] = await Promise.all([this.model.countDocuments(query), this.model.find(query, null, options).exec()]);
    return { count, records };
  }

  async findMany(query?: FilterQuery<T>, options?: QueryOptions<T>) {
    return this.model.find(query || {}, null, options).exec();
  }

  async create({ data }: { data: Partial<T> }) {
    return this.model.create(data);
  }

  async createMany(data: Partial<T>[]) {
    return this.model.insertMany(data);
  }

  async findOne(query: FilterQuery<T>, options?: QueryOptions<T>) {
    return this.model.findOne(query, null, options).exec();
  }

  async update(query: FilterQuery<T>, config: { data: UpdateQuery<T>; options?: QueryOptions<T>; customError?: string }) {
    const { data, options, customError } = config ?? {};
    if ('_id' in query) {
      await this.findOneOrThrow({ _id: query._id } as FilterQuery<T>, { options, customError });
    }
    return this.model.findOneAndUpdate(query, data, { new: true, ...options }).exec();
  }

  async findOneOrThrow(query: FilterQuery<T>, config?: { options?: QueryOptions<T>; customError?: string }) {
    const { options, customError } = config ?? {};
    const result = await this.model.findOne(query, null, options).exec();
    const schema = capitalizeFirst(this.model.modelName);

    if (!result) {
      throw new NotFoundError(customError ?? `${schema} not found!`);
    }
    return result;
  }

  async findOneAndThrow(query: FilterQuery<T>, config?: { customError?: string }) {
    const { customError } = config ?? {};
    const result = await this.model.findOne(query).exec();
    const schema = capitalizeFirst(this.model.modelName);

    if (result) {
      throw new BadRequestError(customError ?? `${schema} already exists`);
    }
    return result;
  }

  async count(query?: FilterQuery<T>) {
    return this.model.countDocuments(query || {}).exec();
  }

  async aggregate(pipeline: PipelineStage[]) {
    return this.model.aggregate(pipeline).exec();
  }

  async upsert(query: FilterQuery<T>, data: Partial<T>) {
    return this.model.findOneAndUpdate(query, data, { new: true, upsert: true }).exec();
  }

  async delete(query: FilterQuery<T>) {
    return this.model.findOneAndDelete(query).exec();
  }

  async deleteMany(query: FilterQuery<T>) {
    return this.model.deleteMany(query).exec();
  }
}

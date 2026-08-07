import { Model, FilterQuery, SortOrder } from 'mongoose';

export interface ListOptions<T> {
  filter?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
  skip?: number;
  limit?: number;
}

export abstract class BaseRepository<T = any> {
  protected constructor(protected readonly model: Model<T>) {}

  async findAll(options: ListOptions<T> = {}): Promise<T[]> {
    const { filter = {}, sort = {}, skip = 0, limit = 100 } = options;
    return this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec() as Promise<T[]>;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec() as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return created.save() as Promise<T>;
  }

  async update(
    filter: FilterQuery<T>,
    data: Partial<T>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, data, { new: true, runValidators: true })
      .exec() as Promise<T | null>;
  }

  async delete(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec() as Promise<T | null>;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}

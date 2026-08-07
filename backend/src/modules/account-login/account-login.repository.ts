import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  AccountLogin,
  AccountLoginDocument,
} from './schemas/account-login.schema';

@Injectable()
export class AccountLoginRepository extends BaseRepository<AccountLoginDocument> {
  constructor(
    @InjectModel(AccountLogin.name)
    private readonly accountLoginModel: Model<AccountLoginDocument>,
  ) {
    super(accountLoginModel);
  }

  async findByUserName(
    userName: string,
  ): Promise<AccountLoginDocument | null> {
    return this.accountLoginModel.findOne({ userName }).exec();
  }

  async findInactive(days = 3): Promise<AccountLoginDocument[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return this.accountLoginModel
      .find({ lastLoginDateTime: { $lt: threshold } })
      .exec();
  }
}

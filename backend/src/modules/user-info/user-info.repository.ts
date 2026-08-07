import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { UserInfo, UserInfoDocument } from './schemas/user-info.schema';

@Injectable()
export class UserInfoRepository extends BaseRepository<UserInfoDocument> {
  constructor(
    @InjectModel(UserInfo.name)
    private readonly userInfoModel: Model<UserInfoDocument>,
  ) {
    super(userInfoModel);
  }

  async findByAccountNumber(
    accountNumber: string,
  ): Promise<UserInfoDocument | null> {
    return this.userInfoModel.findOne({ accountNumber }).exec();
  }

  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<UserInfoDocument | null> {
    return this.userInfoModel.findOne({ registrationNumber }).exec();
  }

  async existsByUniqueFields(
    userId?: string,
    accountNumber?: string,
    emailAddress?: string,
    registrationNumber?: string,
  ): Promise<boolean> {
    const filter: FilterQuery<UserInfoDocument> = {};
    if (userId) filter.userId = userId;
    if (accountNumber) filter.accountNumber = accountNumber;
    if (emailAddress) filter.emailAddress = emailAddress;
    if (registrationNumber) filter.registrationNumber = registrationNumber;

    const count = await this.userInfoModel.countDocuments(filter).exec();
    return count > 0;
  }
}

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
    accountNumber?: string,
    emailAddress?: string,
    registrationNumber?: string,
  ): Promise<boolean> {
    const orConditions: any[] = [];
    if (accountNumber) orConditions.push({ accountNumber });
    if (emailAddress) orConditions.push({ emailAddress });
    if (registrationNumber) orConditions.push({ registrationNumber });

    if (orConditions.length === 0) return false;

    const count = await this.userInfoModel
      .countDocuments({ $or: orConditions })
      .exec();
    return count > 0;
  }
}

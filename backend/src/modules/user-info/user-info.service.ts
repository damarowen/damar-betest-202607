import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserInfoRepository } from './user-info.repository';
import { RedisService } from '../redis/redis.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UserInfoDocument } from './schemas/user-info.schema';
import { AccountLogin } from '../account-login/schemas/account-login.schema';

@Injectable()
export class UserInfoService {
  private readonly CACHE_PREFIX = 'userinfo';

  constructor(
    private readonly userInfoRepository: UserInfoRepository,
    private readonly redisService: RedisService,
    @InjectModel(AccountLogin.name)
    private readonly accountLoginModel: Model<AccountLogin>,
  ) {}

  private cacheKey(key: string): string {
    return `${this.CACHE_PREFIX}:${key}`;
  }

  async findAll(query: {
    fullName?: string;
    role?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    const filter: Record<string, any> = {};
    if (query.fullName) {
      filter.fullName = { $regex: query.fullName, $options: 'i' };
    }
    if (query.role) {
      filter.role = query.role;
    }

    const sort: Record<string, 1 | -1> = {};
    if (query.sort) {
      const direction = query.sort.startsWith('-') ? -1 : 1;
      const field = query.sort.replace(/^-/, '');
      sort[field] = direction;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userInfoRepository.findAll({ filter, sort, skip, limit }),
      this.userInfoRepository.count(filter),
    ]);

    const userObjectIds = data.map((u) => u._id);
    const accounts = await this.accountLoginModel
      .find({ userInfoId: { $in: userObjectIds } })
      .select('userInfoId lastLoginDateTime')
      .lean();

    const accountMap = new Map(
      accounts.map((a) => [a.userInfoId.toString(), a]),
    );

    const enriched = data.map((user) => {
      const obj = user.toObject ? user.toObject() : { ...user };
      const account = accountMap.get(user._id.toString());
      return {
        ...obj,
        accountId: account?._id?.toString() || null,
        lastLoginDateTime: account?.lastLoginDateTime || null,
      };
    });

    return { data: enriched, total };
  }

  async findById(id: string): Promise<UserInfoDocument> {
    const cacheKey = this.cacheKey(`id:${id}`);
    const cached = await this.redisService.get<UserInfoDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userInfoRepository.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('UserInfo', id);
    }

    await this.redisService.set(cacheKey, user);
    return user;
  }

  async findByAccountNumber(
    accountNumber: string,
  ): Promise<UserInfoDocument> {
    const cacheKey = this.cacheKey(`account:${accountNumber}`);
    const cached = await this.redisService.get<UserInfoDocument>(cacheKey);
    if (cached) return cached;

    const user =
      await this.userInfoRepository.findByAccountNumber(accountNumber);
    if (!user) {
      throw new NotFoundException('UserInfo by accountNumber', accountNumber);
    }

    await this.redisService.set(cacheKey, user);
    return user;
  }

  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<UserInfoDocument> {
    const cacheKey = this.cacheKey(`registration:${registrationNumber}`);
    const cached = await this.redisService.get<UserInfoDocument>(cacheKey);
    if (cached) return cached;

    const user =
      await this.userInfoRepository.findByRegistrationNumber(registrationNumber);
    if (!user) {
      throw new NotFoundException(
        'UserInfo by registrationNumber',
        registrationNumber,
      );
    }

    await this.redisService.set(cacheKey, user);
    return user;
  }

  async create(
    dto: CreateUserInfoDto,
    callerRole?: string,
  ): Promise<UserInfoDocument> {
    if (callerRole !== 'admin' && dto.role === 'admin') {
      throw new ForbiddenException(
        'Only admin can create users with admin role',
      );
    }

    const exists = await this.userInfoRepository.existsByUniqueFields(
      dto.accountNumber,
      dto.emailAddress,
      dto.registrationNumber,
    );

    if (exists) {
      throw new ConflictException('User with given unique fields already exists');
    }

    const existingAccount = await this.accountLoginModel.findOne({
      userName: dto.userName,
    });
    if (existingAccount) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.userInfoRepository.create({
      fullName: dto.fullName,
      accountNumber: dto.accountNumber,
      emailAddress: dto.emailAddress,
      registrationNumber: dto.registrationNumber,
      role: dto.role,
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.accountLoginModel.create({
      userName: dto.userName,
      password: hashedPassword,
      userInfoId: user._id,
      lastLoginDateTime: new Date(),
    });

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserInfoDto,
    callerRole?: string,
    callerUserInfoId?: string,
  ): Promise<UserInfoDocument> {
    const existing = await this.userInfoRepository.findOne({ _id: id });
    if (!existing) {
      throw new NotFoundException('UserInfo', id);
    }

    if (callerRole !== 'admin' && callerUserInfoId !== id) {
      throw new ForbiddenException('You can only edit your own data');
    }

    if (callerRole !== 'admin' && dto.role === 'admin') {
      throw new ForbiddenException(
        'Only admin can assign admin role',
      );
    }

    if (dto.accountNumber || dto.emailAddress || dto.registrationNumber) {
      const orConditions: any[] = [];
      if (dto.accountNumber && dto.accountNumber !== existing.accountNumber) {
        orConditions.push({ accountNumber: dto.accountNumber });
      }
      if (dto.emailAddress && dto.emailAddress !== existing.emailAddress) {
        orConditions.push({ emailAddress: dto.emailAddress });
      }
      if (
        dto.registrationNumber &&
        dto.registrationNumber !== existing.registrationNumber
      ) {
        orConditions.push({ registrationNumber: dto.registrationNumber });
      }

      if (orConditions.length > 0) {
        const conflict = await this.userInfoRepository.existsByUniqueFields(
          orConditions[0]?.accountNumber,
          orConditions[0]?.emailAddress,
          orConditions[0]?.registrationNumber,
        );
        if (conflict) {
          throw new ConflictException('Duplicate unique field value');
        }
      }
    }

    const updated = await this.userInfoRepository.update({ _id: id }, dto);
    await this.invalidateCache(id);
    return updated;
  }

  async delete(id: string): Promise<UserInfoDocument> {
    const deleted = await this.userInfoRepository.delete({ _id: id });
    if (!deleted) {
      throw new NotFoundException('UserInfo', id);
    }

    await this.invalidateCache(id);
    return deleted;
  }

  private async invalidateCache(id: string): Promise<void> {
    const user = await this.userInfoRepository.findOne({ _id: id });
    const keys: string[] = [this.cacheKey(`id:${id}`)];
    if (user) {
      keys.push(
        this.cacheKey(`account:${user.accountNumber}`),
        this.cacheKey(`registration:${user.registrationNumber}`),
      );
    }
    await Promise.all(keys.map((key) => this.redisService.del(key)));
  }
}

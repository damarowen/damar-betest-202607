import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserInfoRepository } from './user-info.repository';
import { RedisService } from '../redis/redis.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UserInfoDocument } from './schemas/user-info.schema';

@Injectable()
export class UserInfoService {
  private readonly CACHE_PREFIX = 'userinfo';

  constructor(
    private readonly userInfoRepository: UserInfoRepository,
    private readonly redisService: RedisService,
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
  }): Promise<{ data: UserInfoDocument[]; total: number }> {
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

    return { data, total };
  }

  async findById(userId: string): Promise<UserInfoDocument> {
    const cacheKey = this.cacheKey(`id:${userId}`);
    const cached = await this.redisService.get<UserInfoDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userInfoRepository.findOne({ userId });
    if (!user) {
      throw new NotFoundException('UserInfo', userId);
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

  async create(dto: CreateUserInfoDto): Promise<UserInfoDocument> {
    const exists = await this.userInfoRepository.existsByUniqueFields(
      dto.userId,
      dto.accountNumber,
      dto.emailAddress,
      dto.registrationNumber,
    );

    if (exists) {
      throw new ConflictException('User with given unique fields already exists');
    }

    return this.userInfoRepository.create(dto);
  }

  async update(
    userId: string,
    dto: UpdateUserInfoDto,
  ): Promise<UserInfoDocument> {
    if (dto.accountNumber || dto.emailAddress || dto.registrationNumber) {
      const exists = await this.userInfoRepository.existsByUniqueFields(
        undefined,
        dto.accountNumber,
        dto.emailAddress,
        dto.registrationNumber,
      );
      if (exists) {
        throw new ConflictException('Duplicate unique field value');
      }
    }

    const updated = await this.userInfoRepository.update({ userId }, dto);
    if (!updated) {
      throw new NotFoundException('UserInfo', userId);
    }

    await this.invalidateCache(userId);
    return updated;
  }

  async delete(userId: string): Promise<UserInfoDocument> {
    const deleted = await this.userInfoRepository.delete({ userId });
    if (!deleted) {
      throw new NotFoundException('UserInfo', userId);
    }

    await this.invalidateCache(userId);
    return deleted;
  }

  private async invalidateCache(userId: string): Promise<void> {
    const user = await this.userInfoRepository.findOne({ userId });
    const keys: string[] = [this.cacheKey(`id:${userId}`)];
    if (user) {
      keys.push(
        this.cacheKey(`account:${user.accountNumber}`),
        this.cacheKey(`registration:${user.registrationNumber}`),
      );
    }
    await Promise.all(keys.map((key) => this.redisService.del(key)));
  }
}

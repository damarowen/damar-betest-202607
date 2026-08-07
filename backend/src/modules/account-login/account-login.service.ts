import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AccountLoginRepository } from './account-login.repository';
import { CreateAccountLoginDto } from './dto/create-account-login.dto';
import { UpdateAccountLoginDto } from './dto/update-account-login.dto';
import { AccountLoginDocument } from './schemas/account-login.schema';

@Injectable()
export class AccountLoginService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly accountLoginRepository: AccountLoginRepository,
  ) {}

  async findAll(query: {
    userName?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AccountLoginDocument[]; total: number }> {
    const filter: Record<string, any> = {};
    if (query.userName) {
      filter.userName = { $regex: query.userName, $options: 'i' };
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
      this.accountLoginRepository.findAll({ filter, sort, skip, limit }),
      this.accountLoginRepository.count(filter),
    ]);

    return { data, total };
  }

  async findById(accountId: string): Promise<AccountLoginDocument> {
    const account = await this.accountLoginRepository.findOne({ accountId });
    if (!account) {
      throw new NotFoundException('AccountLogin', accountId);
    }
    return account;
  }

  async findInactive(
    days = 3,
  ): Promise<{ data: AccountLoginDocument[]; total: number }> {
    const data = await this.accountLoginRepository.findInactive(days);
    return { data, total: data.length };
  }

  async create(dto: CreateAccountLoginDto): Promise<AccountLoginDocument> {
    const existing = await this.accountLoginRepository.findOne({
      $or: [{ accountId: dto.accountId }, { userName: dto.userName }],
    });

    if (existing) {
      throw new ConflictException(
        'Account with given accountId or userName already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    return this.accountLoginRepository.create({
      ...dto,
      password: hashedPassword,
      lastLoginDateTime: new Date(),
    });
  }

  async update(
    accountId: string,
    dto: UpdateAccountLoginDto,
  ): Promise<AccountLoginDocument> {
    const updateData: Partial<AccountLoginDocument> = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(
        dto.password,
        this.SALT_ROUNDS,
      );
    }

    const updated = await this.accountLoginRepository.update(
      { accountId },
      updateData,
    );

    if (!updated) {
      throw new NotFoundException('AccountLogin', accountId);
    }

    return updated;
  }

  async delete(accountId: string): Promise<AccountLoginDocument> {
    const deleted = await this.accountLoginRepository.delete({ accountId });
    if (!deleted) {
      throw new NotFoundException('AccountLogin', accountId);
    }
    return deleted;
  }
}

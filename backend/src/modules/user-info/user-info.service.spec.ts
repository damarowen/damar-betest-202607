import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserInfoService } from './user-info.service';
import { UserInfoRepository } from './user-info.repository';
import { RedisService } from '../redis/redis.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

const mockRepository = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByAccountNumber: jest.fn(),
  findByRegistrationNumber: jest.fn(),
  existsByUniqueFields: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockAccountLoginModel = {
  find: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn(),
};

describe('UserInfoService', () => {
  let service: UserInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInfoService,
        { provide: UserInfoRepository, useValue: mockRepository },
        { provide: RedisService, useValue: mockRedisService },
        { provide: getModelToken('AccountLogin'), useValue: mockAccountLoginModel },
      ],
    }).compile();

    service = module.get<UserInfoService>(UserInfoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const users = [{ _id: 'abc123', fullName: 'Damar', toObject: () => ({ _id: 'abc123', fullName: 'Damar' }) }];
    mockRepository.findAll.mockResolvedValue(users);
    mockRepository.count.mockResolvedValue(1);
    mockAccountLoginModel.find.mockReturnThis();
    mockAccountLoginModel.select.mockReturnThis();
    mockAccountLoginModel.lean.mockResolvedValue([]);

    const result = await service.findAll({});
    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe('abc123');
    expect(result.data[0].accountId).toBeNull();
    expect(result.data[0].lastLoginDateTime).toBeNull();
    expect(result.total).toBe(1);
  });

  it('should enrich users with account-login data', async () => {
    const users = [{ _id: 'abc123', fullName: 'Damar', toObject: () => ({ _id: 'abc123', fullName: 'Damar' }) }];
    const accounts = [{ _id: 'acc001', userInfoId: 'abc123', lastLoginDateTime: new Date('2026-08-08') }];
    mockRepository.findAll.mockResolvedValue(users);
    mockRepository.count.mockResolvedValue(1);
    mockAccountLoginModel.find.mockReturnThis();
    mockAccountLoginModel.select.mockReturnThis();
    mockAccountLoginModel.lean.mockResolvedValue(accounts);

    const result = await service.findAll({});
    expect(result.data[0].accountId).toBe('acc001');
    expect(result.data[0].lastLoginDateTime).toEqual(new Date('2026-08-08'));
  });

  it('should find user by id with cache', async () => {
    const user = { _id: 'abc123', fullName: 'Damar' };
    mockRedisService.get.mockResolvedValue(null);
    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findById('abc123');
    expect(result).toEqual(user);
    expect(mockRedisService.set).toHaveBeenCalled();
  });

  it('should throw NotFoundException when user not found', async () => {
    mockRedisService.get.mockResolvedValue(null);
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findById('abc123')).rejects.toThrow(NotFoundException);
  });

  it('should create user as admin', async () => {
    const dto = {
      fullName: 'Damar',
      accountNumber: '100',
      emailAddress: 'damar@example.com',
      registrationNumber: 'REG-1',
      role: 'admin',
      userName: 'damar',
      password: 'password123',
    };
    mockRepository.existsByUniqueFields.mockResolvedValue(false);
    mockAccountLoginModel.findOne.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({ _id: 'abc123', ...dto });

    const result = await service.create(dto, 'admin');
    expect(result.fullName).toBe('Damar');
    expect(mockAccountLoginModel.create).toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user creates admin', async () => {
    const dto = {
      fullName: 'Damar',
      accountNumber: '100',
      emailAddress: 'damar@example.com',
      registrationNumber: 'REG-1',
      role: 'admin',
      userName: 'damar',
      password: 'password123',
    };

    await expect(service.create(dto, 'user')).rejects.toThrow(ForbiddenException);
  });

  it('should allow user to create user role', async () => {
    const dto = {
      fullName: 'Regular',
      accountNumber: '200',
      emailAddress: 'regular@example.com',
      registrationNumber: 'REG-2',
      role: 'user',
      userName: 'regular',
      password: 'password123',
    };
    mockRepository.existsByUniqueFields.mockResolvedValue(false);
    mockAccountLoginModel.findOne.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({ _id: 'def456', ...dto });

    const result = await service.create(dto, 'user');
    expect(result.fullName).toBe('Regular');
    expect(mockAccountLoginModel.create).toHaveBeenCalled();
  });

  it('should throw ConflictException on duplicate', async () => {
    const dto = {
      fullName: 'Damar',
      accountNumber: '100',
      emailAddress: 'damar@example.com',
      registrationNumber: 'REG-1',
      role: 'admin',
      userName: 'damar',
      password: 'password123',
    };
    mockRepository.existsByUniqueFields.mockResolvedValue(true);

    await expect(service.create(dto, 'admin')).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException on duplicate userName', async () => {
    const dto = {
      fullName: 'Damar',
      accountNumber: '100',
      emailAddress: 'damar@example.com',
      registrationNumber: 'REG-1',
      role: 'admin',
      userName: 'damar',
      password: 'password123',
    };
    mockRepository.existsByUniqueFields.mockResolvedValue(false);
    mockAccountLoginModel.findOne.mockResolvedValue({ userName: 'damar' });

    await expect(service.create(dto, 'admin')).rejects.toThrow(ConflictException);
  });

  it('should allow user to update own data', async () => {
    const existing = { _id: 'abc123', fullName: 'Damar', accountNumber: '100', emailAddress: 'damar@example.com', registrationNumber: 'REG-1' };
    const dto = { fullName: 'Updated' };
    mockRepository.findOne.mockResolvedValue(existing);
    mockRepository.update.mockResolvedValue({ ...existing, ...dto });

    const result = await service.update('abc123', dto, 'user', 'abc123');
    expect(result.fullName).toBe('Updated');
  });

  it('should throw ForbiddenException when user edits other user data', async () => {
    const existing = { _id: 'abc123', fullName: 'Damar', accountNumber: '100', emailAddress: 'damar@example.com', registrationNumber: 'REG-1' };
    const dto = { fullName: 'Updated' };
    mockRepository.findOne.mockResolvedValue(existing);

    await expect(service.update('abc123', dto, 'user', 'xyz789')).rejects.toThrow(ForbiddenException);
  });

  it('should allow admin to update any user data', async () => {
    const existing = { _id: 'abc123', fullName: 'Damar', accountNumber: '100', emailAddress: 'damar@example.com', registrationNumber: 'REG-1' };
    const dto = { fullName: 'Updated' };
    mockRepository.findOne.mockResolvedValue(existing);
    mockRepository.update.mockResolvedValue({ ...existing, ...dto });

    const result = await service.update('abc123', dto, 'admin', 'admin-id');
    expect(result.fullName).toBe('Updated');
  });
});

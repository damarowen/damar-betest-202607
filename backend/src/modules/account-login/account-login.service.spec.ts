import { Test, TestingModule } from '@nestjs/testing';
import { AccountLoginService } from './account-login.service';
import { AccountLoginRepository } from './account-login.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

const mockRepository = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findInactive: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('AccountLoginService', () => {
  let service: AccountLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountLoginService,
        { provide: AccountLoginRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AccountLoginService>(AccountLoginService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all accounts', async () => {
    const accounts = [{ _id: 'abc123', userName: 'damar' }];
    mockRepository.findAll.mockResolvedValue(accounts);
    mockRepository.count.mockResolvedValue(1);

    const result = await service.findAll({});
    expect(result.data).toEqual(accounts);
    expect(result.total).toBe(1);
  });

  it('should find inactive accounts', async () => {
    const accounts = [{ _id: 'abc123', lastLoginDateTime: new Date() }];
    mockRepository.findInactive.mockResolvedValue(accounts);

    const result = await service.findInactive(3);
    expect(result.data).toEqual(accounts);
    expect(result.total).toBe(1);
  });

  it('should create account with hashed password', async () => {
    const dto = {
      userName: 'damar',
      password: 'plain',
      userInfoId: '507f1f77bcf86cd799439011',
    };
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({ ...dto, password: 'hashed' });

    const result = await service.create(dto);
    expect(result.password).toBe('hashed');
  });
});

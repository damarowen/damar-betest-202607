import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AccountLogin } from '../account-login/schemas/account-login.schema';

export interface AuthPayload {
  accountId: string;
  userName: string;
  userId: string;
  role?: string;
}

export interface LoginResult {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AccountLogin.name)
    private readonly accountLoginModel: Model<AccountLogin>,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(
    userName: string,
    password: string,
  ): Promise<AuthPayload> {
    const account = await this.accountLoginModel
      .findOne({ userName })
      .populate('userInfo')
      .exec();

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.accountLoginModel.updateOne(
      { accountId: account.accountId },
      { lastLoginDateTime: new Date() },
    );

    const userInfo = account.userInfo as any;

    return {
      accountId: account.accountId,
      userName: account.userName,
      userId: account.userId,
      role: userInfo?.role,
    };
  }

  async login(userName: string, password: string): Promise<LoginResult> {
    const payload = await this.validateCredentials(userName, password);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

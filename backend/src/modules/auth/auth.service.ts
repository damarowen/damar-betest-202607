import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AccountLogin } from '../account-login/schemas/account-login.schema';
import { UserInfo } from '../user-info/schemas/user-info.schema';

export interface AuthPayload {
  accountLoginId: string;
  userName: string;
  userInfoId: string;
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
    @InjectModel(UserInfo.name)
    private readonly userInfoModel: Model<UserInfo>,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(
    userName: string,
    password: string,
  ): Promise<AuthPayload> {
    const account = await this.accountLoginModel
      .findOne({ userName })
      .select('+password')
      .exec();

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.accountLoginModel.updateOne(
      { _id: account._id },
      { lastLoginDateTime: new Date() },
    );

    const userInfo = await this.userInfoModel
      .findOne({ _id: account.userInfoId })
      .lean()
      .exec();

    if (!account.userInfoId) {
      throw new UnauthorizedException('Account has no associated user info');
    }

    return {
      accountLoginId: account._id.toString(),
      userName: account.userName,
      userInfoId: account.userInfoId.toString(),
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

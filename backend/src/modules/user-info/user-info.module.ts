import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { UserInfoRepository } from './user-info.repository';
import { UserInfo, UserInfoSchema } from './schemas/user-info.schema';
import { AccountLogin, AccountLoginSchema } from '../account-login/schemas/account-login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInfo.name, schema: UserInfoSchema },
      { name: AccountLogin.name, schema: AccountLoginSchema },
    ]),
  ],
  controllers: [UserInfoController],
  providers: [UserInfoService, UserInfoRepository],
  exports: [UserInfoService, UserInfoRepository],
})
export class UserInfoModule {}

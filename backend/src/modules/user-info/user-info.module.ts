import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { UserInfoRepository } from './user-info.repository';
import { UserInfo, UserInfoSchema } from './schemas/user-info.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInfo.name, schema: UserInfoSchema },
    ]),
  ],
  controllers: [UserInfoController],
  providers: [UserInfoService, UserInfoRepository],
  exports: [UserInfoService, UserInfoRepository],
})
export class UserInfoModule {}

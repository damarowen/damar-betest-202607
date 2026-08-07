import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountLoginService } from './account-login.service';
import { AccountLoginController } from './account-login.controller';
import { AccountLoginRepository } from './account-login.repository';
import {
  AccountLogin,
  AccountLoginSchema,
} from './schemas/account-login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountLogin.name, schema: AccountLoginSchema },
    ]),
  ],
  controllers: [AccountLoginController],
  providers: [AccountLoginService, AccountLoginRepository],
  exports: [AccountLoginService, AccountLoginRepository],
})
export class AccountLoginModule {}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserInfo } from '../../user-info/schemas/user-info.schema';

export type AccountLoginDocument = HydratedDocument<AccountLogin>;

@Schema({ timestamps: true, collection: 'accountlogins' })
export class AccountLogin {
  @Prop({ required: true, unique: true })
  accountId: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: Date.now })
  lastLoginDateTime: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserInfo.name })
  userInfo: UserInfo;
}

export const AccountLoginSchema = SchemaFactory.createForClass(AccountLogin);

AccountLoginSchema.index({ userId: 1 });
AccountLoginSchema.index({ lastLoginDateTime: -1 });

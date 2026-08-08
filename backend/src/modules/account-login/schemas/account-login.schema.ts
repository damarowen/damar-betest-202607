import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { UserInfo } from '../../user-info/schemas/user-info.schema';

export type AccountLoginDocument = HydratedDocument<AccountLogin>;

@Schema({ timestamps: true, collection: 'accountlogins' })
export class AccountLogin {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, default: Date.now })
  lastLoginDateTime: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserInfo.name, required: true })
  userInfoId: Types.ObjectId;
}

export const AccountLoginSchema = SchemaFactory.createForClass(AccountLogin);

AccountLoginSchema.index({ userInfoId: 1 });
AccountLoginSchema.index({ lastLoginDateTime: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserInfoDocument = HydratedDocument<UserInfo>;

@Schema({ timestamps: true, collection: 'userinfos' })
export class UserInfo {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  accountNumber: string;

  @Prop({ required: true, unique: true })
  emailAddress: string;

  @Prop({ required: true, unique: true })
  registrationNumber: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;
}

export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);

UserInfoSchema.index({ fullName: 'text' });

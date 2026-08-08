import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const accountLoginModel = app.get<Model<any>>(
    getModelToken('AccountLogin'),
  );
  const userInfoModel = app.get<Model<any>>(getModelToken('UserInfo'));

  console.log('Seeding database...');

  const existing = await accountLoginModel.findOne({ userName: 'admin' }).exec();
  if (existing) {
    console.log('Seed data already exists. Skipping.');
    await app.close();
    return;
  }

  const adminUser = await userInfoModel.create({
    fullName: 'Admin User',
    accountNumber: '100000000',
    emailAddress: 'admin@example.com',
    registrationNumber: 'REG-2024-0001',
    role: 'admin',
  });
  console.log('Created UserInfo:', adminUser.fullName);

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await accountLoginModel.create({
    userName: 'admin',
    password: hashedPassword,
    lastLoginDateTime: new Date(),
    userInfoId: adminUser._id,
  });
  console.log('Created AccountLogin: admin');

  const regularUser = await userInfoModel.create({
    fullName: 'Regular User',
    accountNumber: '100000001',
    emailAddress: 'user@example.com',
    registrationNumber: 'REG-2024-0002',
    role: 'user',
  });
  await accountLoginModel.create({
    userName: 'user',
    password: await bcrypt.hash('user123', 10),
    lastLoginDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    userInfoId: regularUser._id,
  });
  console.log('Created UserInfo:', regularUser.fullName);
  console.log('Created AccountLogin: user');

  console.log('\n========================================');
  console.log('  Seed completed!');
  console.log('  Admin login:');
  console.log('    Username: admin');
  console.log('    Password: admin123');
  console.log('  User login:');
  console.log('    Username: user');
  console.log('    Password: user123');
  console.log('========================================\n');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

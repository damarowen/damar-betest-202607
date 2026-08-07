import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
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

  // Cek apakah user sudah ada
  const existing = await accountLoginModel.findOne({ userName: 'admin' }).exec();
  if (existing) {
    console.log('Seed data already exists. Skipping.');
    await app.close();
    return;
  }

  // Buat UserInfo
  const userInfo = await userInfoModel.create({
    userId: 'user-admin-001',
    fullName: 'Admin User',
    accountNumber: '100000000',
    emailAddress: 'admin@example.com',
    registrationNumber: 'REG-2024-0001',
    role: 'admin',
  });
  console.log('Created UserInfo:', userInfo.fullName);

  // Buat AccountLogin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const accountLogin = await accountLoginModel.create({
    accountId: 'acc-admin-001',
    userName: 'admin',
    password: hashedPassword,
    lastLoginDateTime: new Date(),
    userId: 'user-admin-001',
  });
  console.log('Created AccountLogin:', accountLogin.userName);

  // Tambah user biasa juga
  const userInfo2 = await userInfoModel.create({
    userId: 'user-002',
    fullName: 'Regular User',
    accountNumber: '100000001',
    emailAddress: 'user@example.com',
    registrationNumber: 'REG-2024-0002',
    role: 'user',
  });
  const accountLogin2 = await accountLoginModel.create({
    accountId: 'acc-002',
    userName: 'user',
    password: await bcrypt.hash('user123', 10),
    lastLoginDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    userId: 'user-002',
  });
  console.log('Created UserInfo:', userInfo2.fullName);
  console.log('Created AccountLogin:', accountLogin2.userName);

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

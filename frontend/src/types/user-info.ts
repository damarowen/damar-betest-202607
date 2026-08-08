export interface UserInfo {
  _id: string;
  fullName: string;
  accountNumber: string;
  emailAddress: string;
  registrationNumber: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
  accountId?: string | null;
  lastLoginDateTime?: string | null;
}

export interface UserInfoListResponse {
  data: UserInfo[];
  total: number;
}

export interface UserInfoFilter {
  fullName?: string;
  role?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface UserInfoFormData {
  fullName: string;
  accountNumber: string;
  emailAddress: string;
  registrationNumber: string;
  role: 'admin' | 'user';
  userName?: string;
  password?: string;
}

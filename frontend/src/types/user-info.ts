export interface UserInfo {
  _id?: string;
  userId: string;
  fullName: string;
  accountNumber: string;
  emailAddress: string;
  registrationNumber: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
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
  userId: string;
  fullName: string;
  accountNumber: string;
  emailAddress: string;
  registrationNumber: string;
  role: 'admin' | 'user';
}

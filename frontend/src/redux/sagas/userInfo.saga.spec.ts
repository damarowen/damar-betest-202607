import { describe, it, expect, beforeEach, vi } from 'vitest';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import userInfoSaga, {
  fetchUsersSaga,
  fetchUserSaga,
  createUserSaga,
  updateUserSaga,
  deleteUserSaga,
  fetchUserByAccountNumberSaga,
} from './userInfo.saga';
import {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserStart,
  fetchUserSuccess,
  fetchUserFailure,
  createUserStart,
  createUserSuccess,
  createUserFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  setOnlineStatus,
} from '../slices/userInfo.slice';
import { CacheService } from '../../services/cache.service';
import api from '../../api/axios';

vi.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockUser = {
  _id: 'abc123',
  fullName: 'Damar',
  accountNumber: '100',
  emailAddress: 'damar@example.com',
  registrationNumber: 'REG-1',
  role: 'admin' as const,
};

describe('userInfo saga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  it('should watch all actions', () => {
    const gen = userInfoSaga();
    const effect = gen.next().value;
    expect(effect.type).toBe('ALL');
    expect(gen.next().done).toBe(true);
  });

  it('should fetch users and cache them', () => {
    const response = { data: { data: [mockUser], total: 1 } };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    const gen = fetchUsersSaga(fetchUsersStart({}));

    expect(gen.next().value).toEqual(put(setOnlineStatus(true)));
    expect(gen.next().value).toEqual(
      call([api, 'get'], '/user-infos', { params: {} }),
    );
    expect(gen.next(response).value).toEqual(put(fetchUsersSuccess(response.data)));
    expect(gen.next().done).toBe(true);
  });

  it('should use cached users when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    const cached = { data: [mockUser], total: 1 };
    const cacheKey = `users:list:p1:l10:fullName:all:s`;
    new CacheService().set(cacheKey, cached);

    const gen = fetchUsersSaga(fetchUsersStart({}));

    expect(gen.next().value).toEqual(put(setOnlineStatus(false)));
    expect(gen.next().value).toEqual(put(fetchUsersSuccess(cached)));
    expect(gen.next().done).toBe(true);
  });

  it('should handle fetch users failure', () => {
    const error = { response: { data: { message: 'Network error' } } };

    const gen = fetchUsersSaga(fetchUsersStart({}));

    expect(gen.next().value).toEqual(put(setOnlineStatus(true)));
    expect(gen.next().value).toEqual(
      call([api, 'get'], '/user-infos', { params: {} }),
    );
    expect(gen.throw(error).value).toEqual(put(fetchUsersFailure('Network error')));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch user detail', () => {
    const response = { data: mockUser };

    const gen = fetchUserSaga(fetchUserStart('abc123'));

    expect(gen.next().value).toEqual(put(setOnlineStatus(true)));
    expect(gen.next().value).toEqual(call([api, 'get'], '/user-infos/abc123'));
    expect(gen.next(response).value).toEqual(put(fetchUserSuccess(mockUser)));
    expect(gen.next().done).toBe(true);
  });

  it('should create user', () => {
    const response = { data: mockUser };

    const gen = createUserSaga(createUserStart({ fullName: 'Damar', accountNumber: '100', emailAddress: 'damar@example.com', registrationNumber: 'REG-1', role: 'admin' }));

    expect(gen.next().value).toEqual(
      call([api, 'post'], '/user-infos', { fullName: 'Damar', accountNumber: '100', emailAddress: 'damar@example.com', registrationNumber: 'REG-1', role: 'admin' }),
    );
    expect(gen.next(response).value).toEqual(put(createUserSuccess(mockUser)));
    expect(gen.next().done).toBe(true);
  });

  it('should fail create user when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const gen = createUserSaga(createUserStart({ fullName: 'Damar', accountNumber: '100', emailAddress: 'damar@example.com', registrationNumber: 'REG-1', role: 'admin' }));

    expect(gen.next().value).toEqual(
      put(createUserFailure('You are offline. Cannot create user.')),
    );
    expect(gen.next().done).toBe(true);
  });

  it('should update user and clear cache', () => {
    const response = { data: mockUser };

    const gen = updateUserSaga(
      updateUserStart({ id: 'abc123', data: { fullName: 'Updated' } }),
    );

    expect(gen.next().value).toEqual(
      call([api, 'put'], '/user-infos/abc123', { fullName: 'Updated' }),
    );
    expect(gen.next(response).value).toEqual(put(updateUserSuccess(mockUser)));
    expect(gen.next().done).toBe(true);
  });

  it('should delete user and clear cache', () => {
    const gen = deleteUserSaga(deleteUserStart('abc123'));

    expect(gen.next().value).toEqual(call([api, 'delete'], '/user-infos/abc123'));
    expect(gen.next({}).value).toEqual(put(deleteUserSuccess('abc123')));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch user by account number', () => {
    const response = { data: mockUser };

    const gen = fetchUserByAccountNumberSaga({ payload: '100' });

    expect(gen.next().value).toEqual(put(setOnlineStatus(true)));
    expect(gen.next().value).toEqual(
      call([api, 'get'], '/user-infos/account-number/100'),
    );
    expect(gen.next(response).value).toEqual(put(fetchUserSuccess(mockUser)));
    expect(gen.next().done).toBe(true);
  });
});

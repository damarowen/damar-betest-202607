import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import api from '../../api/axios';
import { CacheService } from '../../services/cache.service';
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
import {
  UserInfo,
  UserInfoListResponse,
  UserInfoFilter,
} from '../../types/user-info';

const CACHE_KEY = 'users:list';
const CACHE_DETAIL_PREFIX = 'users:detail:';

export const createCache = () => new CacheService();

export function* fetchUsersSaga(action: ReturnType<typeof fetchUsersStart>) {
  const filter: UserInfoFilter = action.payload || {};
  const cache = createCache();

  try {
    const isOnline = navigator.onLine;
    yield put(setOnlineStatus(isOnline));

    if (!isOnline) {
      const cached = cache.get<UserInfoListResponse>(CACHE_KEY);
      if (cached) {
        yield put(fetchUsersSuccess(cached));
        return;
      }
      throw new Error('No cached data available');
    }

    const response: { data: UserInfoListResponse } = yield call(
      [api, 'get'],
      '/user-infos',
      { params: filter },
    );
    cache.set(CACHE_KEY, response.data);
    yield put(fetchUsersSuccess(response.data));
  } catch (error: any) {
    yield put(
      fetchUsersFailure(
        error.response?.data?.message || error.message || 'Failed to fetch users',
      ),
    );
  }
}

export function* fetchUserSaga(action: ReturnType<typeof fetchUserStart>) {
  const userId = action.payload;
  const cacheKey = `${CACHE_DETAIL_PREFIX}${userId}`;
  const cache = createCache();

  try {
    const isOnline = navigator.onLine;
    yield put(setOnlineStatus(isOnline));

    if (!isOnline) {
      const cached = cache.get<UserInfo>(cacheKey);
      if (cached) {
        yield put(fetchUserSuccess(cached));
        return;
      }
      throw new Error('No cached data available');
    }

    const response: { data: UserInfo } = yield call(
      [api, 'get'],
      `/user-infos/${userId}`,
    );
    cache.set(cacheKey, response.data);
    yield put(fetchUserSuccess(response.data));
  } catch (error: any) {
    yield put(
      fetchUserFailure(
        error.response?.data?.message || error.message || 'Failed to fetch user',
      ),
    );
  }
}

export function* fetchUserByAccountNumberSaga(action: any) {
  const accountNumber = action.payload as string;
  const cacheKey = `${CACHE_DETAIL_PREFIX}account:${accountNumber}`;
  const cache = createCache();

  try {
    const isOnline = navigator.onLine;
    yield put(setOnlineStatus(isOnline));

    if (!isOnline) {
      const cached = cache.get<UserInfo>(cacheKey);
      if (cached) {
        yield put(fetchUserSuccess(cached));
        return;
      }
      throw new Error('No cached data available');
    }

    const response: { data: UserInfo } = yield call(
      [api, 'get'],
      `/user-infos/account-number/${accountNumber}`,
    );
    cache.set(cacheKey, response.data);
    yield put(fetchUserSuccess(response.data));
  } catch (error: any) {
    yield put(
      fetchUserFailure(
        error.response?.data?.message || error.message || 'Failed to fetch user',
      ),
    );
  }
}

export function* createUserSaga(action: ReturnType<typeof createUserStart>) {
  const cache = createCache();

  try {
    if (!navigator.onLine) {
      throw new Error('You are offline. Cannot create user.');
    }

    const response: { data: UserInfo } = yield call(
      [api, 'post'],
      '/user-infos',
      action.payload,
    );
    cache.remove(CACHE_KEY);
    yield put(createUserSuccess(response.data));
  } catch (error: any) {
    yield put(
      createUserFailure(
        error.response?.data?.message || error.message || 'Failed to create user',
      ),
    );
  }
}

export function* updateUserSaga(action: ReturnType<typeof updateUserStart>) {
  const cache = createCache();

  try {
    if (!navigator.onLine) {
      throw new Error('You are offline. Cannot update user.');
    }

    const { userId, data } = action.payload;
    const response: { data: UserInfo } = yield call(
      [api, 'put'],
      `/user-infos/${userId}`,
      data,
    );
    cache.remove(CACHE_KEY);
    cache.remove(`${CACHE_DETAIL_PREFIX}${userId}`);
    yield put(updateUserSuccess(response.data));
  } catch (error: any) {
    yield put(
      updateUserFailure(
        error.response?.data?.message || error.message || 'Failed to update user',
      ),
    );
  }
}

export function* deleteUserSaga(action: ReturnType<typeof deleteUserStart>) {
  const cache = createCache();

  try {
    if (!navigator.onLine) {
      throw new Error('You are offline. Cannot delete user.');
    }

    const userId = action.payload;
    yield call([api, 'delete'], `/user-infos/${userId}`);
    cache.remove(CACHE_KEY);
    cache.remove(`${CACHE_DETAIL_PREFIX}${userId}`);
    yield put(deleteUserSuccess(userId));
  } catch (error: any) {
    yield put(
      deleteUserFailure(
        error.response?.data?.message || error.message || 'Failed to delete user',
      ),
    );
  }
}

function* watchFetchUsers() {
  yield takeLatest('userInfo/fetchUsersStart', fetchUsersSaga);
}

function* watchFetchUser() {
  yield takeLatest('userInfo/fetchUserStart', fetchUserSaga);
}

function* watchFetchUserByAccountNumber() {
  yield takeLatest(
    'userInfo/fetchUserByAccountNumberStart',
    fetchUserByAccountNumberSaga,
  );
}

function* watchCreateUser() {
  yield takeEvery('userInfo/createUserStart', createUserSaga);
}

function* watchUpdateUser() {
  yield takeEvery('userInfo/updateUserStart', updateUserSaga);
}

function* watchDeleteUser() {
  yield takeEvery('userInfo/deleteUserStart', deleteUserSaga);
}

export default function* userInfoSaga() {
  yield all([
    watchFetchUsers(),
    watchFetchUser(),
    watchFetchUserByAccountNumber(),
    watchCreateUser(),
    watchUpdateUser(),
    watchDeleteUser(),
  ]);
}

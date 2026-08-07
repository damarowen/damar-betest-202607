import { all } from 'redux-saga/effects';
import userInfoSaga from './userInfo.saga';

export default function* rootSaga() {
  yield all([userInfoSaga()]);
}

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  UserInfo,
  UserInfoListResponse,
  UserInfoFilter,
  UserInfoFormData,
} from '../../types/user-info';

export interface UserInfoState {
  users: UserInfo[];
  total: number;
  selectedUser: UserInfo | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  isOnline: boolean;
  filter: UserInfoFilter;
}

const initialState: UserInfoState = {
  users: [],
  total: 0,
  selectedUser: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  isOnline: navigator.onLine,
  filter: {
    page: 1,
    limit: 10,
    sort: 'fullName',
  },
};

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setFilter: (state, action: PayloadAction<UserInfoFilter>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    fetchUsersStart: (
      state,
      _action: PayloadAction<UserInfoFilter | undefined>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (
      state,
      action: PayloadAction<UserInfoListResponse>,
    ) => {
      state.loading = false;
      state.users = action.payload.data;
      state.total = action.payload.total;
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchUserStart: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.selectedUser = null;
      state.error = null;
    },
    fetchUserSuccess: (state, action: PayloadAction<UserInfo>) => {
      state.loading = false;
      state.selectedUser = action.payload;
    },
    fetchUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchUserByAccountNumberStart: (
      state,
      _action: PayloadAction<string>,
    ) => {
      state.loading = true;
      state.selectedUser = null;
      state.error = null;
    },

    fetchUserByRegistrationNumberStart: (
      state,
      _action: PayloadAction<string>,
    ) => {
      state.loading = true;
      state.selectedUser = null;
      state.error = null;
    },

    createUserStart: (
      state,
      _action: PayloadAction<UserInfoFormData>,
    ) => {
      state.creating = true;
      state.error = null;
    },
    createUserSuccess: (state, action: PayloadAction<UserInfo>) => {
      state.creating = false;
      state.users = [action.payload, ...state.users];
      state.total += 1;
    },
    createUserFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.error = action.payload;
    },

    updateUserStart: (
      state,
      _action: PayloadAction<{ id: string; data: Partial<UserInfoFormData> }>,
    ) => {
      state.updating = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<UserInfo>) => {
      state.updating = false;
      state.users = state.users.map((user) =>
        user._id === action.payload._id ? action.payload : user,
      );
      if (state.selectedUser?._id === action.payload._id) {
        state.selectedUser = action.payload;
      }
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.updating = false;
      state.error = action.payload;
    },

    deleteUserStart: (state, _action: PayloadAction<string>) => {
      state.deleting = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.users = state.users.filter(
        (user) => user._id !== action.payload,
      );
      state.total -= 1;
      if (state.selectedUser?._id === action.payload) {
        state.selectedUser = null;
      }
    },
    deleteUserFailure: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.error = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setFilter,
  clearSelectedUser,
  clearError,
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserStart,
  fetchUserSuccess,
  fetchUserFailure,
  fetchUserByAccountNumberStart,
  fetchUserByRegistrationNumberStart,
  createUserStart,
  createUserSuccess,
  createUserFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} = userInfoSlice.actions;

export default userInfoSlice.reducer;

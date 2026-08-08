import userInfoReducer, {
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
  setFilter,
} from './userInfo.slice';

describe('userInfo slice', () => {
  const initialState = {
    users: [],
    total: 0,
    selectedUser: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
    isOnline: true,
    filter: { page: 1, limit: 10, sort: 'fullName' },
  };

  it('should handle fetchUsersStart', () => {
    const state = userInfoReducer(initialState, fetchUsersStart({ page: 1 }));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchUsersSuccess', () => {
    const payload = { data: [{ _id: 'abc123', fullName: 'Damar' }], total: 1 };
    const state = userInfoReducer(initialState, fetchUsersSuccess(payload));
    expect(state.loading).toBe(false);
    expect(state.users).toEqual(payload.data);
    expect(state.total).toBe(1);
  });

  it('should handle fetchUsersFailure', () => {
    const state = userInfoReducer(initialState, fetchUsersFailure('Error'));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error');
  });

  it('should handle fetchUserStart', () => {
    const state = userInfoReducer(initialState, fetchUserStart('abc123'));
    expect(state.loading).toBe(true);
    expect(state.selectedUser).toBeNull();
  });

  it('should handle fetchUserSuccess', () => {
    const user = { _id: 'abc123', fullName: 'Damar' };
    const state = userInfoReducer(initialState, fetchUserSuccess(user));
    expect(state.loading).toBe(false);
    expect(state.selectedUser).toEqual(user);
  });

  it('should handle createUserSuccess', () => {
    const user = { _id: 'abc123', fullName: 'Damar' };
    const state = userInfoReducer(
      { ...initialState, creating: true },
      createUserSuccess(user),
    );
    expect(state.creating).toBe(false);
    expect(state.users).toContainEqual(user);
    expect(state.total).toBe(1);
  });

  it('should handle updateUserSuccess', () => {
    const user = { _id: 'abc123', fullName: 'Updated' };
    const state = userInfoReducer(
      { ...initialState, users: [{ _id: 'abc123', fullName: 'Damar' }], updating: true },
      updateUserSuccess(user),
    );
    expect(state.updating).toBe(false);
    expect(state.users[0].fullName).toBe('Updated');
  });

  it('should handle deleteUserSuccess', () => {
    const state = userInfoReducer(
      { ...initialState, users: [{ _id: 'abc123', fullName: 'Damar' }], deleting: true, total: 1 },
      deleteUserSuccess('abc123'),
    );
    expect(state.deleting).toBe(false);
    expect(state.users).toHaveLength(0);
    expect(state.total).toBe(0);
  });

  it('should handle setFilter', () => {
    const state = userInfoReducer(initialState, setFilter({ role: 'admin' }));
    expect(state.filter.role).toBe('admin');
  });
});

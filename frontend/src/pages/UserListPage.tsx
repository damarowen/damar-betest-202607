import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import {
  fetchUsersStart,
  deleteUserStart,
  setFilter,
} from '../redux/slices/userInfo.slice';
import { UserInfo } from '../types/user-info';
import Modal from '../components/common/Modal';

export default function UserListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, total, loading, deleting, filter, error } = useSelector(
    (state: RootState) => state.userInfo,
  );

  const [deleteTarget, setDeleteTarget] = useState<UserInfo | null>(null);

  useEffect(() => {
    dispatch(fetchUsersStart(filter));
  }, [dispatch, filter.page, filter.limit, filter.sort, filter.role]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchUsersStart(filter));
    }, 300);
    return () => clearTimeout(timeout);
  }, [dispatch, filter.fullName]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilter({ ...filter, sort: e.target.value, page: 1 }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilter({ ...filter, role: e.target.value, page: 1 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ ...filter, fullName: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilter({ ...filter, page: newPage }));
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch(deleteUserStart(deleteTarget.userId));
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / (filter.limit || 10)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <button
          onClick={() => navigate('/users/add')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter.fullName || ''}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <select
          value={filter.role || ''}
          onChange={handleRoleChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          value={filter.sort || 'fullName'}
          onChange={handleSortChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="fullName">Name A-Z</option>
          <option value="-fullName">Name Z-A</option>
          <option value="registrationNumber">Registration A-Z</option>
          <option value="-registrationNumber">Registration Z-A</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 font-medium">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Account No</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.accountNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{user.emailAddress}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/users/${user.userId}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Detail
                    </Link>
                    <Link
                      to={`/users/edit/${user.userId}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
        <span>
          Page {filter.page || 1} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => handlePageChange((filter.page || 1) - 1)}
            disabled={(filter.page || 1) <= 1}
            className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange((filter.page || 1) + 1)}
            disabled={(filter.page || 1) >= totalPages}
            className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
      >
        <p className="text-slate-700 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deleteTarget?.fullName}</span>?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

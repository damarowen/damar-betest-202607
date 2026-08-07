import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AppDispatch, RootState } from '../redux/store';
import {
  createUserStart,
  updateUserStart,
  fetchUserStart,
  clearSelectedUser,
  clearError,
} from '../redux/slices/userInfo.slice';
import { UserInfoFormData } from '../types/user-info';

export default function UserFormPage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isEdit = Boolean(userId);

  const { selectedUser, loading, creating, updating, error } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const role = useSelector((state: RootState) => state.auth.role);
  const isAdmin = role === 'admin';

  const [finished, setFinished] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserInfoFormData>({
    defaultValues: {
      userId: '',
      fullName: '',
      accountNumber: '',
      emailAddress: '',
      registrationNumber: '',
      role: 'user',
    },
  });

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserStart(userId));
    }
    return () => {
      dispatch(clearSelectedUser());
      dispatch(clearError());
      setFinished(false);
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (isEdit && selectedUser) {
      reset({
        userId: selectedUser.userId,
        fullName: selectedUser.fullName,
        accountNumber: selectedUser.accountNumber,
        emailAddress: selectedUser.emailAddress,
        registrationNumber: selectedUser.registrationNumber,
        role: selectedUser.role,
      });
    }
  }, [isEdit, selectedUser, reset]);

  useEffect(() => {
    if (finished && !creating && !updating && !error) {
      navigate('/users');
    }
  }, [finished, creating, updating, error, navigate]);

  const onSubmit = (data: UserInfoFormData) => {
    if (isEdit && userId) {
      dispatch(updateUserStart({ userId, data }));
    } else {
      dispatch(createUserStart(data));
    }
    setFinished(true);
  };

  const isBusy = creating || updating || loading;

  if (isEdit && !selectedUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading user data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit User' : 'Add New User'}
        </h1>
        <button
          onClick={() => navigate('/users')}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
        >
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl space-y-5"
      >
        <FormInput
          label="User ID"
          {...register('userId', { required: 'User ID is required' })}
          disabled={isEdit || isBusy}
          error={errors.userId?.message}
        />
        <FormInput
          label="Full Name"
          {...register('fullName', { required: 'Full name is required' })}
          disabled={isBusy}
          error={errors.fullName?.message}
        />
        <FormInput
          label="Account Number"
          {...register('accountNumber', { required: 'Account number is required' })}
          disabled={isBusy}
          error={errors.accountNumber?.message}
        />
        <FormInput
          label="Email Address"
          type="email"
          {...register('emailAddress', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
          disabled={isBusy}
          error={errors.emailAddress?.message}
        />
        <FormInput
          label="Registration Number"
          {...register('registrationNumber', {
            required: 'Registration number is required',
          })}
          disabled={isBusy}
          error={errors.registrationNumber?.message}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role
          </label>
          <select
            {...register('role', { required: true })}
            disabled={isBusy || !isAdmin}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100"
          >
            <option value="user">User</option>
            {isAdmin && <option value="admin">Admin</option>}
          </select>
          {!isAdmin && (
            <p className="mt-1 text-xs text-slate-500">
              You can only create users with role "user".
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/users')}
            disabled={isBusy}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-60"
          >
            {isBusy ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(({ label, error, ...inputProps }, ref) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        ref={ref}
        {...inputProps}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-slate-300 focus:border-emerald-500'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});
FormInput.displayName = 'FormInput';

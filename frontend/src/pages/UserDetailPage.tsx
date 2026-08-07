import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { fetchUserStart, clearSelectedUser } from '../redux/slices/userInfo.slice';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedUser, loading, error } = useSelector(
    (state: RootState) => state.userInfo,
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserStart(userId));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, userId]);

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!selectedUser) return <div className="text-slate-500">User not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Detail</h1>
        <div className="space-x-3">
          <Link
            to={`/users/edit/${selectedUser.userId}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Edit
          </Link>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 max-w-2xl">
        <DetailRow label="Full Name" value={selectedUser.fullName} />
        <DetailRow label="Account Number" value={selectedUser.accountNumber} />
        <DetailRow label="Email Address" value={selectedUser.emailAddress} />
        <DetailRow label="Registration Number" value={selectedUser.registrationNumber} />
        <DetailRow label="Role" value={selectedUser.role} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 last:border-0 pb-4 last:pb-0">
      <span className="text-slate-500 text-sm w-40">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-slate-600 mb-8">Page not found.</p>
      <Link
        to="/users"
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
      >
        Go to Users
      </Link>
    </div>
  );
}

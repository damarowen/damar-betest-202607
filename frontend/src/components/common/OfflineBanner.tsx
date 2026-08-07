import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-100 text-amber-800 px-4 py-2 text-center text-sm font-medium">
      You are offline. Showing cached data.
    </div>
  );
}

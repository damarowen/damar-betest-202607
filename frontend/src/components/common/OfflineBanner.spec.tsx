import { render, screen } from '@testing-library/react';
import OfflineBanner from './OfflineBanner';
import { OnlineStatusProvider } from '../../hooks/useOnlineStatus';

describe('OfflineBanner', () => {
  it('should not render when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    render(
      <OnlineStatusProvider>
        <OfflineBanner />
      </OnlineStatusProvider>,
    );
    expect(screen.queryByText(/You are offline/)).not.toBeInTheDocument();
  });

  it('should render when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    render(
      <OnlineStatusProvider>
        <OfflineBanner />
      </OnlineStatusProvider>,
    );
    expect(screen.getByText(/You are offline/)).toBeInTheDocument();
  });
});

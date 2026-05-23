import { useState, useCallback, lazy, Suspense } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { RoutingProvider } from './context/RoutingContext';
import { useAnalytics } from './hooks/useAnalytics';

const Dashboard = lazy(() => import('./components/Dashboard'));

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  useAnalytics();

  const handleLaunchDashboard = useCallback(() => {
    setShowDashboard(true);
  }, []);

  if (showDashboard) {
    return (
      <RoutingProvider>
        <Suspense fallback={<LoadingSkeleton />}>
          <Dashboard />
        </Suspense>
      </RoutingProvider>
    );
  }

  return <LandingPage onLaunchDashboard={handleLaunchDashboard} />;
}

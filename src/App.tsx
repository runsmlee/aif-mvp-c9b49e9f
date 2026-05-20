import Dashboard from './components/Dashboard';
import { useAnalytics } from './hooks/useAnalytics';

export default function App() {
  useAnalytics();
  return <Dashboard />;
}

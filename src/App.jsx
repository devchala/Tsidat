import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportsList from './pages/reports/ReportsList';
import ReportDetails from './pages/reports/ReportDetails';
import WorkersList from './pages/workers/WorkersList';
import WorkerDetails from './pages/workers/WorkerDetails';
import Assignments from './pages/Assignments';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import ActivityLogs from './pages/ActivityLogs';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<ReportsList />} />
        <Route path="reports/:id" element={<ReportDetails />} />
        <Route path="map" element={<MapView />} />
        <Route path="workers" element={<WorkersList />} />
        <Route path="workers/:id" element={<WorkerDetails />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

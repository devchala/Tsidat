import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ReportWaste from '../pages/citizen/ReportWaste.jsx';
import MyReports from '../pages/citizen/MyReports.jsx';
import TaskDashboard from '../pages/worker/TaskDashboard.jsx';
import CommandCenter from '../pages/admin/CommandCenter.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute roles={['citizen']}>
            <ReportWaste />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute roles={['citizen']}>
            <MyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks"
        element={
          <ProtectedRoute roles={['worker']}>
            <TaskDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <CommandCenter />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

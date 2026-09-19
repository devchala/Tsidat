import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkerDashboard from './pages/worker/worker-dashboard';
import ReportWaste from './pages/citizen/ReportWaste';
import MyReports from './pages/citizen/MyReports';

export default function App() {
  return (
    <Routes>
      {/* Citizen / User Routes */}
      <Route path="/citizen/report" element={<ReportWaste />} />
      <Route path="/citizen/my-reports" element={<MyReports />} />

      {/* Worker Routes */}
      <Route path="/worker" element={<WorkerDashboard />} />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/citizen/report" replace />} />
    </Routes>
  );
}
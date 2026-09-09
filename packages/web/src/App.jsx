import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkerDashboard from './pages/worker/WorkerDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/worker" element={<WorkerDashboard />} />
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  );
}
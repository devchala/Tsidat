import React, { useState } from 'react';

export default function WorkerDashboard() {
  const [assignedTasks, setAssignedTasks] = useState([
    {
      id: 'REP-9021',
      category: 'Plastic & Garbage Dump',
      location: 'Sector 4, Block B',
      severity: 'High',
      isEmergency: true,
      status: 'Pending',
      description: 'Accumulated waste overflowing onto main pedestrian pathway.',
      adminNote: 'Priority dispatch. Clear bins and verify clean perimeter.'
    },
    {
      id: 'REP-7410',
      category: 'Drainage Debris',
      location: 'Main Street Crossing',
      severity: 'Critical',
      isEmergency: false,
      status: 'In Progress',
      description: 'Heavy debris clogging main culvert ahead of rain season.',
      adminNote: 'Inspect drainage flow after clearing debris.'
    }
  ]);

  return (
    <div style={{ padding: '24px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Worker Dispatch Console</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            Field action portal linked to Admin commands & Citizen report tracking.
          </p>
        </div>
        <span style={{ fontSize: '13px', backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontWeight: '600' }}>
          Active Tasks: {assignedTasks.length}
        </span>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

export default function WorkerDashboard() {
  const [filter, setFilter] = useState('All');
  const [assignedTasks, setAssignedTasks] = useState([
    {
      id: 'REP-9021',
      category: 'Plastic & Garbage Dump',
      location: 'Sector 4, Block B',
      severity: 'High',
      isEmergency: true,
      status: 'Pending',
      description: 'Accumulated waste overflowing onto main pedestrian pathway.',
      adminNote: 'Priority dispatch. Clear bins and verify clean perimeter.',
      resolutionNote: ''
    },
    {
      id: 'REP-7410',
      category: 'Drainage Debris',
      location: 'Main Street Crossing',
      severity: 'Critical',
      isEmergency: false,
      status: 'In Progress',
      description: 'Heavy debris clogging main culvert ahead of rain season.',
      adminNote: 'Inspect drainage flow after clearing debris.',
      resolutionNote: 'Debris partially removed; completing final rinse.'
    }
  ]);

  const updateTaskStatus = (id, newStatus) => {
    setAssignedTasks(prev =>
      prev.map(task => task.id === id ? { ...task, status: newStatus } : task)
    );
  };

  const handleNoteChange = (id, note) => {
    setAssignedTasks(prev =>
      prev.map(task => task.id === id ? { ...task, resolutionNote: note } : task)
    );
  };

  const filteredTasks = assignedTasks.filter(task => {
    if (filter === 'All') return true;
    return task.status === filter;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      {/* Header Banner */}
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: filter === tab ? '#0284c7' : '#f1f5f9',
              color: filter === tab ? '#ffffff' : '#64748b'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Cards Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTasks.map((task) => (
          <div key={task.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                  {task.id}
                </span>
                {task.isEmergency && (
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                    ⚡ EMERGENCY
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '600',
                backgroundColor: task.status === 'Resolved' ? '#dcfce7' : task.status === 'In Progress' ? '#e0f2fe' : '#fef3c7',
                color: task.status === 'Resolved' ? '#15803d' : task.status === 'In Progress' ? '#0369a1' : '#b45309'
              }}>
                {task.status}
              </span>
            </div>

            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1e293b' }}>{task.category}</h3>

            <div style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 6px 0' }}><strong>📍 Location:</strong> {task.location}</p>
              <p style={{ margin: '0 0 6px 0' }}><strong>📝 Description:</strong> {task.description}</p>
              <p style={{ margin: '0', color: '#0284c7' }}><strong>📋 Admin Instruction:</strong> {task.adminNote}</p>
            </div>

            {/* Resolution Note Input Field */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                Field Resolution Note / Verification Details
              </label>
              <input 
                type="text" 
                placeholder="Enter completion notes or field observations..."
                value={task.resolutionNote}
                onChange={(e) => handleNoteChange(task.id, e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            {/* Status Action Controls */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              {task.status === 'Pending' && (
                <button 
                  onClick={() => updateTaskStatus(task.id, 'In Progress')}
                  style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                >
                  Acknowledge & Start
                </button>
              )}
              {task.status === 'In Progress' && (
                <button 
                  onClick={() => updateTaskStatus(task.id, 'Resolved')}
                  style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                >
                  Mark as Resolved
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
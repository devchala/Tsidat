import React, { useState } from 'react';

export default function WorkerDashboard() {
  const [assignedTasks, setAssignedTasks] = useState([
    {
      id: 'TSK-1001',
      reportId: 'TRK-9021',
      category: 'Household Waste',
      location: 'Sector 4, Block B',
      priority: 'High',
      status: 'Assigned',
      instructions: 'Clear accumulated waste bins behind residential block.',
      clientContact: '+251 91 123 4567'
    },
    {
      id: 'TSK-1002',
      reportId: 'TRK-7410',
      category: 'Blocked Drain',
      location: 'Main Street Crossing',
      priority: 'Critical',
      status: 'In Progress',
      instructions: 'Inspect and clear heavy debris blocking storm drainage.',
      clientContact: '+251 92 987 6543'
    }
  ]);

  const updateTaskStatus = (taskId, newStatus) => {
    setAssignedTasks(prev =>
      prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Worker Field Console</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
          Manage dispatched tasks from Admin and update job status in real time.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {assignedTasks.map((task) => (
          <div key={task.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                  {task.id} (Report: {task.reportId})
                </span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: '#1e293b' }}>{task.category}</h3>
              </div>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '600',
                backgroundColor: task.status === 'Completed' ? '#dcfce7' : task.status === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                color: task.status === 'Completed' ? '#15803d' : task.status === 'In Progress' ? '#b45309' : '#475569'
              }}>
                {task.status}
              </span>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 6px 0' }}><strong>📍 Location:</strong> {task.location}</p>
              <p style={{ margin: '0 0 6px 0' }}><strong>📋 Admin Command:</strong> {task.instructions}</p>
              <p style={{ margin: '0' }}><strong>📞 Client Contact:</strong> {task.clientContact}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              {task.status !== 'In Progress' && task.status !== 'Completed' && (
                <button 
                  onClick={() => updateTaskStatus(task.id, 'In Progress')}
                  style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                >
                  Start Task
                </button>
              )}
              {task.status === 'In Progress' && (
                <button 
                  onClick={() => updateTaskStatus(task.id, 'Completed')}
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
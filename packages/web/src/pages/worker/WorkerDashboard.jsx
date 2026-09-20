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
      resolutionNote: '',
      proofImage: null,
      updatedAt: 'Just now'
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
      resolutionNote: 'Debris partially removed; completing final rinse.',
      proofImage: null,
      updatedAt: '10 mins ago'
    }
  ]);

  const updateTaskStatus = (id, newStatus) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAssignedTasks(prev =>
      prev.map(task => task.id === id ? { ...task, status: newStatus, updatedAt: `Updated at ${timestamp}` } : task)
    );
  };

  const handleNoteChange = (id, note) => {
    setAssignedTasks(prev =>
      prev.map(task => task.id === id ? { ...task, resolutionNote: note } : task)
    );
  };

  const handlePhotoUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setAssignedTasks(prev =>
        prev.map(task => task.id === id ? { ...task, proofImage: URL.createObjectURL(file) } : task)
      );
    }
  };

  const filteredTasks = assignedTasks.filter(task => {
    if (filter === 'All') return true;
    return task.status === filter;
  });

  const totalCount = assignedTasks.length;
  const pendingCount = assignedTasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = assignedTasks.filter(t => t.status === 'In Progress').length;
  const resolvedCount = assignedTasks.filter(t => t.status === 'Resolved').length;

  return (
    <div style={{ padding: '24px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Worker Dispatch Console</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            Field action portal linked to Admin commands & Citizen report tracking.
          </p>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Assigned</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{totalCount}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fef3c7', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>Pending</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#b45309', marginTop: '2px' }}>{pendingCount}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>In Progress</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#0369a1', marginTop: '2px' }}>{inProgressCount}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #dcfce7', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Resolved</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#15803d', marginTop: '2px' }}>{resolvedCount}</div>
        </div>
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

      {/* Empty State Guard */}
      {filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ margin: 0, color: '#64748b', fontWeight: '500', fontSize: '15px' }}>
            No tasks found matching status: <strong>{filter}</strong>
          </p>
        </div>
      ) : (
        /* Task Cards Display */
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
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {task.updatedAt}
                  </span>
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

              {/* Resolution Note & Proof Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                <div>
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    Attach Completion Proof Photo
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(task.id, e)}
                    style={{ fontSize: '12px', color: '#64748b' }}
                  />
                  {task.proofImage && (
                    <div style={{ marginTop: '8px' }}>
                      <img src={task.proofImage} alt="Resolution proof" style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>
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
      )}
    </div>
  );
}
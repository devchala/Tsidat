import React, { useState } from 'react';

export default function MyReports() {
  const [filter, setFilter] = useState('All');

  const reports = [
    { id: 'TRK-9021', category: 'Household Waste', location: 'Kebena, near Church', status: 'Pending', date: '2026-09-09', severity: 'Medium' },
    { id: 'TRK-8812', category: 'Overflowing Dumpster', location: 'Bole Atlas, Main Road', status: 'In Progress', date: '2026-09-08', severity: 'High' },
    { id: 'TRK-7410', category: 'Blocked Drain', location: 'Piassa, Taxi Station', status: 'Resolved', date: '2026-09-05', severity: 'Critical' },
    { id: 'TRK-6105', category: 'Construction Debris', location: 'Kazanchis, Block 4', status: 'Resolved', date: '2026-09-01', severity: 'Low' },
  ];

  const filteredReports = filter === 'All' ? reports : reports.filter(r => r.status === filter);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      'In Progress': { bg: '#e0f2fe', text: '#075985', border: '#bae6fd' },
      Resolved: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    }[status];

    return (
      <span style={{ backgroundColor: styles.bg, color: styles.text, border: `1px solid ${styles.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', padding: '0 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#1e293b', fontWeight: '700' }}>My Incident Dashboard</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Track live resolution updates for your submitted community reports.</p>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Submitted</p>
          <h3 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>{reports.length}</h3>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#075985', fontWeight: '500' }}>In Progress</p>
          <h3 style={{ margin: 0, fontSize: '22px', color: '#0284c7' }}>{reports.filter(r => r.status === 'In Progress').length}</h3>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#166534', fontWeight: '500' }}>Cleaned & Resolved</p>
          <h3 style={{ margin: 0, fontSize: '22px', color: '#16a34a' }}>{reports.filter(r => r.status === 'Resolved').length}</h3>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filter === tab ? '#2d6a4f' : '#f1f5f9',
              color: filter === tab ? '#ffffff' : '#475569',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Incidents Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReports.map((report) => (
          <div key={report.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{report.category}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{report.id}</span>
              </div>
              <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#475569' }}>📍 {report.location}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Submitted on {report.date} • Severity: {report.severity}</p>
            </div>
            <div>
              {getStatusBadge(report.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
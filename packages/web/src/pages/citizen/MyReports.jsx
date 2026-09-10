import React from 'react';

export default function MyReports() {
  const reports = [
    { id: 'T-101', category: 'Household Waste', status: 'Pending', date: '2026-09-09' },
    { id: 'T-102', category: 'Overflowing Dumpster', status: 'In Progress', date: '2026-09-08' },
    { id: 'T-103', category: 'Blocked Drain', status: 'Resolved', date: '2026-09-05' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#e65100';
      case 'In Progress': return '#0288d1';
      case 'Resolved': return '#2e7d32';
      default: return '#757575';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>My Reported Incidents</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {reports.map((report) => (
          <div key={report.id} style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0' }}>{report.category} <span style={{ fontSize: '12px', color: '#666' }}>({report.id})</span></h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Submitted on: {report.date}</p>
            </div>
            <span style={{ backgroundColor: getStatusColor(report.status), color: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
              {report.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
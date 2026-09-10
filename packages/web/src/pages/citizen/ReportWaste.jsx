import React, { useState } from 'react';

export default function ReportWaste() {
  const [formData, setFormData] = useState({
    category: 'Household Waste',
    description: '',
    location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting citizen waste report:', formData);
    alert('Waste report submitted successfully!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Report Waste Accumulation</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Waste Category</label>
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option>Household Waste</option>
            <option>Hazardous Material</option>
            <option>Overflowing Dumpster</option>
            <option>Blocked Drain / Organic Waste</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location Details / GPS</label>
          <input 
            type="text" 
            placeholder="Enter address or landmark" 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
          <textarea 
            rows="4" 
            placeholder="Provide additional details..." 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
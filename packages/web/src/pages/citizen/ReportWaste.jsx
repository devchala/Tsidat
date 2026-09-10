import React, { useState } from 'react';

export default function ReportWaste() {
  const [formData, setFormData] = useState({
    category: 'Household Waste',
    severity: 'Medium',
    location: '',
    description: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`,
          });
        },
        () => alert('Could not retrieve exact location. Please enter manually.')
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '30px auto', padding: '0 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', padding: '28px', borderRadius: '16px', color: '#fff', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(45, 106, 79, 0.3)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '700' }}>Report Waste Accumulation</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Help keep our streets clean. Submit an incident report for quick municipal pickup.</p>
      </div>

      {submitted && (
        <div style={{ padding: '16px', backgroundColor: '#d8f3dc', color: '#1b4332', borderRadius: '12px', border: '1px solid #b7e4c7', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ✓ Incident report successfully submitted! Tracking code generated: #TRK-{Math.floor(1000 + Math.random() * 9000)}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #e9ecef', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Category & Severity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>Waste Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
            >
              <option>Household Waste</option>
              <option>Hazardous Material</option>
              <option>Overflowing Dumpster</option>
              <option>Construction Debris</option>
              <option>Blocked Drain / Organic Waste</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>Severity Level</label>
            <select 
              value={formData.severity} 
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
            >
              <option>Low (Minor litter)</option>
              <option>Medium (Moderate bin overflow)</option>
              <option>High (Blocking pathway/road)</option>
              <option>Critical (Hazardous/Health risk)</option>
            </select>
          </div>
        </div>

        {/* Location Field with Geolocation button */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>Incident Location</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Enter street name, landmark, or area..." 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              required
            />
            <button 
              type="button" 
              onClick={handleGetLocation}
              style={{ padding: '0 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
            >
              📍 Use GPS
            </button>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>Attach Photo Proof</label>
          <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="photo-upload" />
            <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'block' }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#64748b' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '22px' }}>📷</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Click to upload a clear photo of the waste</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Description Field */}
        <div>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
    <label style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>Additional Details</label>
    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formData.description.length}/300 chars</span>
  </div>
  <textarea 
    maxLength={300}
    rows="3" 
    placeholder="Describe the condition, approximate volume, or access notes..." 
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
  />
</div>

        {/* Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
  <input type="checkbox" id="urgent" style={{ width: '16px', height: '16px', accentColor: '#e53e3e' }} />
  <label htmlFor="urgent" style={{ fontSize: '14px', fontWeight: '600', color: '#c53030', cursor: 'pointer' }}>
    🚨 Mark as Emergency (Immediate sanitation dispatch required)
  </label>
</div>
        <button 
          type="submit" 
          style={{ padding: '14px', backgroundColor: '#2d6a4f', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '10px' }}
        >
          Submit Incident Report
        </button>
      </form>
    </div>
  );
}

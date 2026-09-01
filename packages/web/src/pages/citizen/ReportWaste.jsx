import { useState } from 'react';
import { reportsApi } from '../../api/endpoints/reports.api';
import Navbar from '../../components/layout/Navbar.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';

const CATEGORIES = [
  'general',
  'organic',
  'recyclable',
  'construction',
  'hazardous',
  'illegal_dumping',
  'drainage_blockage',
  'other',
];

// TODO (team): photo capture/upload, automatic GPS pinning, and
// duplicate/nearby-incident warning before submission (spec 6.1).
export default function ReportWaste() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      // Placeholder coordinates - replace with navigator.geolocation or map pin.
      await reportsApi.create({
        category,
        description,
        location: { coordinates: [38.7469, 9.0107] },
      });
      setStatus({ ok: true, msg: 'Report submitted.' });
      setDescription('');
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.message || 'Failed to submit report' });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-w-lg">
          <h1 className="text-xl font-bold mb-4">Report Waste</h1>
          <form onSubmit={handleSubmit} className="space-y-3 bg-white p-6 rounded shadow">
            <select
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Short description"
              className="w-full border rounded px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {status && (
              <p className={status.ok ? 'text-primary text-sm' : 'text-danger text-sm'}>
                {status.msg}
              </p>
            )}
            <Button type="submit">Submit Report</Button>
          </form>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/endpoints/reports.api';
import Navbar from '../../components/layout/Navbar.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';

export default function MyReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    reportsApi.mine().then(({ data }) => setReports(data.reports));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-xl font-bold mb-4">My Reports</h1>
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r._id} className="bg-white p-4 rounded shadow flex justify-between">
                <span className="capitalize">{r.category.replace('_', ' ')}</span>
                <span className="text-sm text-gray-500 capitalize">{r.status.replace('_', ' ')}</span>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500">No reports yet.</p>}
          </div>
        </main>
      </div>
    </div>
  );
}

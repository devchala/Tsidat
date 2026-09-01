import Navbar from '../../components/layout/Navbar.jsx';

// TODO (team): operational KPIs, interactive live map, urgent incident
// queue, worker approval, incident management, manual assignment +
// smart recommendations, analytics, audit logs (spec 6.4, 12).
export default function CommandCenter() {
  return (
    <div>
      <Navbar />
      <main className="p-8">
        <h1 className="text-xl font-bold mb-4">Waste Management Command Center</h1>
        <p className="text-gray-500">KPIs, live map, and incident queue go here.</p>
      </main>
    </div>
  );
}

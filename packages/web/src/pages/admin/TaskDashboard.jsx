import Navbar from '../../components/layout/Navbar.jsx';

// TODO (team): assigned-task list, map/list view toggle, task detail +
// navigation, En Route/In Progress/Completed transitions, completion
// evidence upload (spec 6.3). Wire up to /api/v1/workers once those
// endpoints are built out.
export default function TaskDashboard() {
  return (
    <div>
      <Navbar />
      <main className="p-8">
        <h1 className="text-xl font-bold mb-4">My Tasks</h1>
        <p className="text-gray-500">Assigned task list goes here.</p>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Eye, Check, X, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function WorkersList() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getWorkers().then(data => {
      setWorkers(data);
      setLoading(false);
    });
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Pending Approval') return 'warning';
    return 'danger';
  };

  if (loading) return <div>Loading workers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Worker Management</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
          <input type="text" placeholder="Search workers..." className="px-3 py-2 border rounded-md max-w-xs w-full" />
          <select className="border px-3 py-2 rounded-md bg-white">
            <option>All Statuses</option>
            <option>Approved</option>
            <option>Pending Approval</option>
            <option>Suspended</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                        {worker.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-sm text-gray-500">Joined {format(new Date(worker.joinDate), 'MMM yyyy')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{worker.email}</div>
                    <div className="text-sm text-gray-500">{worker.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadge(worker.status)}>{worker.status}</Badge>
                    <div className="mt-1 text-xs text-gray-500">{worker.availability}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{worker.completedTasks} tasks done</div>
                    <div className="text-sm text-gray-500">{worker.rating > 0 ? `${worker.rating} / 5.0` : 'No ratings'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {worker.status === 'Pending Approval' ? (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/workers/${worker.id}`)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, MapPin, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rep = await api.getReportById(id);
        setReport(rep);
        if (rep.workerId) {
          const w = await api.getWorkerById(rep.workerId);
          setWorker(w);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div>Loading report...</div>;
  if (!report) return <div>Report not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Report {report.id}</h1>
        <Badge variant={report.status === 'Completed' ? 'success' : report.status === 'Submitted' ? 'default' : 'warning'}>
          {report.status}
        </Badge>
        <Badge variant={report.priority === 'High' ? 'danger' : 'info'}>
          {report.priority} Priority
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium">Description</h2>
            <p className="text-gray-700">{report.description}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="block text-sm font-medium text-gray-500">Location</span>
                <span className="flex items-center text-sm text-gray-900 mt-1">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {report.location}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Submitted At</span>
                <span className="flex items-center text-sm text-gray-900 mt-1">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" /> {format(new Date(report.submittedAt), 'PPp')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Evidence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Before Photo</h3>
                <img src={report.photoUrl} alt="Before" className="rounded-lg object-cover w-full h-64 border border-gray-200" />
              </div>
              {report.afterPhotoUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">After Photo</h3>
                  <img src={report.afterPhotoUrl} alt="After" className="rounded-lg object-cover w-full h-64 border border-gray-200" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Timeline</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Report Submitted</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {format(new Date(report.submittedAt), 'MMM d')}
                      </div>
                    </div>
                  </div>
                </li>
                {report.workerId && (
                  <li className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <User className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Assigned to {worker?.name}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
                {report.completedAt && (
                  <li className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Completed</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {format(new Date(report.completedAt), 'MMM d')}
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            <div className="space-y-3">
              <Button className="w-full">Assign Worker</Button>
              <Button variant="outline" className="w-full">Change Priority</Button>
              <Button variant="danger" className="w-full">Reject Report</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

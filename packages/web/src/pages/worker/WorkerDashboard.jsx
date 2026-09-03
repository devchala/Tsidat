import React, { useState } from 'react';
import { 
  MapPin, CheckCircle, Clock, AlertTriangle, Navigation, 
  Upload, Shield, Award, User, Power, RefreshCw, Filter, FileText 
} from 'lucide-react';

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('assigned'); // assigned | route | completed
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Sample tasks state reflecting Tsidat incident models
  const [tasks, setTasks] = useState([
    {
      id: 'INC-2026-089',
      title: 'Commercial Solid Waste Overflow',
      category: 'PLASTIC_COMMERCIAL',
      priority: 'HIGH',
      status: 'ASSIGNED',
      location: 'Bole Sub-City, Ward 03 (Near Edna Mall)',
      reportedAt: '10 mins ago',
      description: 'Multiple uncollected municipal bins overflowing near street vendors. Requires heavy truck pickup.',
      coordinates: '8.9982° N, 38.7865° E',
      contact: '+251 91 123 4567'
    },
    {
      id: 'INC-2026-092',
      title: 'Hazardous Medical Waste Dumping',
      category: 'HAZARDOUS',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      location: 'Kirkos Sub-City, Ward 08',
      reportedAt: '35 mins ago',
      description: 'Illegally dumped clinic containers requiring protective glove gear and containment unit.',
      coordinates: '9.0105° N, 38.7612° E',
      contact: '+251 91 987 6543'
    },
    {
      id: 'INC-2026-074',
      title: 'Drainage Blocking Debris',
      category: 'ORGANIC_DEBRIS',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      location: 'Arada Sub-City, Ward 01',
      reportedAt: '2 hours ago',
      description: 'Cleared organic green waste blocking storm channel.',
      coordinates: '9.0320° N, 38.7520° E',
      completedAt: '1 hour ago'
    }
  ]);

  const handleStatusTransition = (taskId, nextStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: nextStatus }));
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'assigned') return t.status !== 'RESOLVED';
    if (activeTab === 'completed') return t.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Operational Navigation Bar */}
      <header className="bg-emerald-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg font-black text-xl tracking-wider">ጽዳት</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Tsidat Field Operations</h1>
              <p className="text-xs text-emerald-200">Worker Portal • Addis Ababa Fleet Division</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Online / Offline Toggle */}
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isOnline ? 'bg-emerald-700 border-emerald-400 text-emerald-100' : 'bg-slate-700 border-slate-500 text-slate-300'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${isOnline ? 'text-green-400' : 'text-gray-400'}`} />
              <span>{isOnline ? 'ON DUTY (ACTIVE)' : 'OFF DUTY'}</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-500 flex items-center justify-center font-bold text-sm">
              W1
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Metrics & Task Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5"/></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Tasks</p>
                <p className="text-xl font-bold text-slate-800">{tasks.filter(t => t.status !== 'RESOLVED').length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5"/></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Completed Today</p>
                <p className="text-xl font-bold text-slate-800">{tasks.filter(t => t.status === 'RESOLVED').length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Award className="w-5 h-5"/></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Worker Score</p>
                <p className="text-xl font-bold text-slate-800">98%</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex space-x-1">
            <button 
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'assigned' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Active Assignments ({tasks.filter(t => t.status !== 'RESOLVED').length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'completed' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Resolved History ({tasks.filter(t => t.status === 'RESOLVED').length})
            </button>
          </div>

          {/* Task List Cards */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className={`bg-white rounded-xl p-5 border shadow-sm transition cursor-pointer hover:border-emerald-500 ${
                  selectedTask?.id === task.id ? 'ring-2 ring-emerald-600 border-transparent' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400">{task.id}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                    task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-1">{task.title}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-emerald-600"/> {task.location}</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">{task.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Task Inspector & Actions (5 cols) */}
        <div className="lg:col-span-5">
          {selectedTask ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-20 space-y-5">
              <div className="flex justify-between items-start border-b pb-4 border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400">{selectedTask.id}</span>
                  <h2 className="text-lg font-bold text-slate-800">{selectedTask.title}</h2>
                </div>
                <span className="text-xs bg-slate-100 font-bold px-2 py-1 rounded text-slate-600">
                  {selectedTask.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Incident Description</p>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{selectedTask.description}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Dispatch Coordinates</p>
                  <p className="text-slate-700 font-mono mt-0.5">{selectedTask.coordinates}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Sub-City Location</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{selectedTask.location}</p>
                </div>
              </div>

              {/* Photo Evidence Upload Container */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Attach Resolution Photo</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Required before marking task as resolved</p>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedTask.status === 'ASSIGNED' && (
                  <button 
                    onClick={() => handleStatusTransition(selectedTask.id, 'EN_ROUTE')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-4 h-4"/> <span>Start Transit (En Route)</span>
                  </button>
                )}

                {selectedTask.status === 'EN_ROUTE' && (
                  <button 
                    onClick={() => handleStatusTransition(selectedTask.id, 'IN_PROGRESS')}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin"/> <span>Arrived & Begin Clean Up</span>
                  </button>
                )}

                {selectedTask.status === 'IN_PROGRESS' && (
                  <button 
                    onClick={() => handleStatusTransition(selectedTask.id, 'RESOLVED')}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4"/> <span>Submit & Mark Resolved</span>
                  </button>
                )}

                {selectedTask.status === 'RESOLVED' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg font-bold text-center">
                    ✓ Task Completed & Verified
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center sticky top-20">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Task Selected</p>
              <p className="text-xs text-slate-400 mt-1">Select an assigned incident card from the list to inspect operational details and execute updates.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
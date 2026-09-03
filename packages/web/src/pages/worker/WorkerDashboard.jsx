import React, { useState, useEffect } from 'react';
import { 
  MapPin, CheckCircle2, Clock, AlertCircle, Navigation2, 
  Upload, ShieldAlert, Award, Power, RefreshCw, Search, 
  Filter, FileText, Camera, Phone, ShieldCheck, Truck, ChevronRight, AlertTriangle
} from 'lucide-react';

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('active'); // active | urgent | completed
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // Humanized state tracking for real-world municipal dispatch
  const [tasks, setTasks] = useState([
    {
      id: 'TSD-9482',
      title: 'Commercial Waste Spill & Drainage Risk',
      category: 'Plastic & Organic',
      priority: 'HIGH',
      status: 'ASSIGNED',
      subcity: 'Bole Sub-City',
      woreda: 'Woreda 03',
      address: 'Near Edna Mall, Ring Road Junction',
      coordinates: '8.9982° N, 38.7865° E',
      contactPerson: 'Abebe Tadesse (Zone Inspector)',
      contactPhone: '+251 91 123 4567',
      reportedTime: '08:15 AM',
      estimatedTonnage: '1.8 Tons',
      requiredEquipment: ['Heavy Loader', 'Hazmat Gloves', 'Containment Bags'],
      description: 'Overflowing commercial dumpster blocking public pedestrian walkway. High hazard during rain due to storm drain proximity.'
    },
    {
      id: 'TSD-9489',
      title: 'Illegal Dumping Near Medical Center',
      category: 'Hazardous Medical',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      subcity: 'Kirkos Sub-City',
      woreda: 'Woreda 08',
      address: 'Behind Abyssinia Clinic',
      coordinates: '9.0105° N, 38.7612° E',
      contactPerson: 'Sister Tigist (Clinic Security)',
      contactPhone: '+251 91 987 6543',
      reportedTime: '07:45 AM',
      estimatedTonnage: '0.5 Tons',
      requiredEquipment: ['PEX Bio-Bins', 'Full Protective Gear', 'Disinfectant Spray'],
      description: 'Unmarked medical waste bags deposited overnight on public sidewalk. Requires immediate sterile containment unit dispatch.'
    },
    {
      id: 'TSD-9410',
      title: 'Market Debris Clean Up',
      category: 'Organic Market Debris',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      subcity: 'Arada Sub-City',
      woreda: 'Woreda 01',
      address: 'Piazza Vegetable Market Sector B',
      coordinates: '9.0320° N, 38.7520° E',
      contactPerson: 'Market Security Desk',
      contactPhone: '+251 91 444 5555',
      reportedTime: '06:00 AM',
      completedTime: '08:30 AM',
      estimatedTonnage: '3.2 Tons',
      requiredEquipment: ['Street Sweeper', 'Open-Bed Truck'],
      description: 'Routine post-morning market organic clearance completed successfully.'
    }
  ]);

  // Task Status Transition Handler
  const handleStatusChange = (taskId, nextStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: nextStatus }));
    }
  };

  // Mock Photo Upload Trigger
  const handlePhotoUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Resolution photo successfully attached and cryptographically timestamped.");
    }, 1200);
  };

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.subcity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;
    
    if (activeTab === 'active') return matchesSearch && matchesPriority && task.status !== 'RESOLVED';
    if (activeTab === 'urgent') return matchesSearch && matchesPriority && task.priority === 'CRITICAL' && task.status !== 'RESOLVED';
    if (activeTab === 'completed') return matchesSearch && matchesPriority && task.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-100">
      
      {/* Humanized Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl font-black text-xl tracking-tight shadow-sm flex items-center justify-center w-10 h-10">
              ጽ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base tracking-tight text-slate-100">ጽዳት OpsPortal</h1>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">v2.4.0</span>
              </div>
              <p className="text-xs text-slate-400">Addis Ababa Solid Waste Management Authority</p>
            </div>
          </div>

          {/* Operational Shift Status Toggle */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isOnline 
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isOnline ? 'Active Shift (Dispatch Ready)' : 'Off Duty'}</span>
            </button>

            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                W-04
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-200">Kassahun Bekele</p>
                <p className="text-[10px] text-slate-400">Crew Lead • Truck #14</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Operational Metrics, Filters & Tasks (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Shift Performance Summary Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{tasks.filter(t => t.status !== 'RESOLVED').length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Assigned to team</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cleared</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{tasks.filter(t => t.status === 'RESOLVED').length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Verified today</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Urgent</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Requires Hazmat</p>
            </div>
          </div>

          {/* Search & Filter Control Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search incident ID, street, or sub-city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-medium text-slate-700"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
              </select>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex border-t border-slate-100 pt-2 gap-2">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'active' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Active Assignments ({tasks.filter(t => t.status !== 'RESOLVED').length})
              </button>

              <button 
                onClick={() => setActiveTab('urgent')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'urgent' ? 'bg-rose-900 text-rose-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Urgent Hazmat
              </button>

              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'completed' ? 'bg-emerald-900 text-emerald-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Resolved History
              </button>
            </div>
          </div>

          {/* Incident Queue List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No matching incidents found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your filters or search term.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer relative hover:shadow-md ${
                    selectedTask?.id === task.id 
                      ? 'border-emerald-600 ring-2 ring-emerald-600/10 shadow-sm' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{task.id}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {task.subcity}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      task.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{task.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {task.address}
                    </span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      {task.status} <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Section: Task Inspector & Actions (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedTask ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sticky top-20 space-y-5">
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">{selectedTask.id}</span>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">{selectedTask.title}</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {selectedTask.status}
                </span>
              </div>

              {/* Specific Field Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Dispatch Target Address</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{selectedTask.address} ({selectedTask.woreda})</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div>
                    <p className="text-slate-400 text-[10px]">Est. Tonnage</p>
                    <p className="font-bold text-slate-800">{selectedTask.estimatedTonnage}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Reported Time</p>
                    <p className="font-bold text-slate-800">{selectedTask.reportedTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 font-medium mb-1">Required Safety Gear & Fleet</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.requiredEquipment.map((eq, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-900 border border-emerald-200/60 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <p className="text-slate-400 font-medium">Site Contact / Dispatcher</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-slate-800">{selectedTask.contactPerson}</span>
                    <a href={`tel:${selectedTask.contactPhone}`} className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              </div>

              {/* Photo Evidence Upload Box */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Attach Clean-up Photo Evidence</p>
                <p className="text-[10px] text-slate-400 mb-2">Required before marking incident resolved</p>
                
                <button 
                  onClick={handlePhotoUpload}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition"
                >
                  {isUploading ? 'Uploading & Encrypting...' : 'Upload Photo Proof'}
                </button>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedTask.status === 'ASSIGNED' && (
                  <button 
                    onClick={() => handleStatusChange(selectedTask.id, 'EN_ROUTE')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Navigation2 className="w-4 h-4 text-emerald-400" />
                    <span>Begin Navigation (En Route)</span>
                  </button>
                )}

                {selectedTask.status === 'EN_ROUTE' && (
                  <button 
                    onClick={() => handleStatusChange(selectedTask.id, 'IN_PROGRESS')}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Arrived & Start Clean-up Operations</span>
                  </button>
                )}

                {selectedTask.status === 'IN_PROGRESS' && (
                  <button 
                    onClick={() => handleStatusChange(selectedTask.id, 'RESOLVED')}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Verification & Resolve</span>
                  </button>
                )}

                {selectedTask.status === 'RESOLVED' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Incident Cleared & Geo-Verified</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center sticky top-20">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Select an Incident Card</p>
              <p className="text-xs text-slate-400 mt-1">Select any incident from the left queue to view dispatch details, safety gear requirements, and execute operational updates.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
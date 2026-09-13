export const mockUser = {
  id: 'admin-1',
  name: 'System Admin',
  email: 'admin@ecotrack.local',
  role: 'ADMIN',
  avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=16a34a&color=fff'
};

export const mockDashboardStats = {
  totalReports: 1248,
  pendingReports: 42,
  assignedReports: 86,
  inProgress: 112,
  completed: 980,
  rejected: 28,
  activeWorkers: 45,
  pendingWorkerApprovals: 3
};

export const mockWorkers = [
  {
    id: 'w-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 555-0101',
    status: 'Approved',
    availability: 'Available',
    activeTasks: 0,
    completedTasks: 142,
    rating: 4.8,
    distance: '1.2 km',
    location: { lat: 40.7128, lng: -74.0060 },
    joinDate: '2023-01-15T10:00:00Z'
  },
  {
    id: 'w-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 555-0102',
    status: 'Approved',
    availability: 'Busy',
    activeTasks: 2,
    completedTasks: 89,
    rating: 4.5,
    distance: '2.5 km',
    location: { lat: 40.7200, lng: -74.0100 },
    joinDate: '2023-03-22T09:30:00Z'
  },
  {
    id: 'w-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1 555-0103',
    status: 'Pending Approval',
    availability: 'Offline',
    activeTasks: 0,
    completedTasks: 0,
    rating: 0,
    distance: 'N/A',
    location: null,
    joinDate: '2024-05-10T14:20:00Z'
  }
];

export const mockReports = [
  {
    id: 'REP-1001',
    description: 'Large pile of construction debris blocking the sidewalk.',
    location: '123 Main St, Downtown',
    coordinates: { lat: 40.7138, lng: -74.0070 },
    priority: 'High',
    status: 'Submitted',
    submittedAt: '2024-05-12T08:30:00Z',
    reporterId: 'cit-992',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    afterPhotoUrl: null,
    workerId: null
  },
  {
    id: 'REP-1002',
    description: 'Overflowing public trash can near the park entrance.',
    location: 'Central Park West',
    coordinates: { lat: 40.7150, lng: -74.0020 },
    priority: 'Medium',
    status: 'In Progress',
    submittedAt: '2024-05-11T14:15:00Z',
    reporterId: 'cit-441',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    afterPhotoUrl: null,
    workerId: 'w-2'
  },
  {
    id: 'REP-1003',
    description: 'Household waste dumped illegally in alleyway.',
    location: '45 Lincoln Ave',
    coordinates: { lat: 40.7110, lng: -74.0090 },
    priority: 'Low',
    status: 'Completed',
    submittedAt: '2024-05-10T09:45:00Z',
    completedAt: '2024-05-11T16:20:00Z',
    reporterId: 'cit-112',
    photoUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&w=800&q=80',
    workerId: 'w-1'
  }
];

export const mockAssignments = [
  {
    id: 'ASG-501',
    reportId: 'REP-1002',
    workerId: 'w-2',
    assignedAt: '2024-05-11T15:00:00Z',
    status: 'Active'
  },
  {
    id: 'ASG-502',
    reportId: 'REP-1003',
    workerId: 'w-1',
    assignedAt: '2024-05-10T10:30:00Z',
    completedAt: '2024-05-11T16:20:00Z',
    status: 'Completed'
  }
];

export const mockNotifications = [
  { id: 'n1', title: 'New High Priority Report', message: 'Report REP-1001 requires immediate attention.', type: 'alert', read: false, createdAt: '2024-05-12T08:35:00Z' },
  { id: 'n2', title: 'Worker Registration', message: 'Mike Johnson is pending approval.', type: 'info', read: false, createdAt: '2024-05-10T14:25:00Z' }
];

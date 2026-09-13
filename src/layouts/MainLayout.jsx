import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Activity, 
  Bell, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/map', icon: Map, label: 'Map View' },
  { to: '/workers', icon: Users, label: 'Workers' },
  { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/activity-logs', icon: Activity, label: 'Activity Logs' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={cn("bg-white border-r border-gray-200 flex flex-col transition-all duration-300", sidebarOpen ? "w-64" : "w-20")}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          <span className={cn("font-bold text-xl text-primary-600 transition-opacity", !sidebarOpen && "hidden")}>EcoTrack</span>
          {!sidebarOpen && <span className="font-bold text-xl text-primary-600">ET</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4 max-w-md w-full hidden sm:block">
              <input type="text" placeholder="Global search..." className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            </Button>
            <div className="flex items-center">
              <img className="h-8 w-8 rounded-full" src={user?.avatar} alt="" />
              <span className="ml-3 font-medium text-sm text-gray-700 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

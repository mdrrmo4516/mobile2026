import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Camera } from 'lucide-react';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 'camera', label: 'Camera', icon: Camera, path: '/geotag-camera' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-blue-950 border-t-2 border-white z-50"
      data-testid="bottom-nav-bar"
    >
      <div className="flex items-center h-16 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(tab.path)
                ? 'text-yellow-500'
                : 'text-white/60 hover:text-white/80'
            }`}
            data-testid={`nav-tab-${tab.id}`}
            type="button"
          >
            <tab.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

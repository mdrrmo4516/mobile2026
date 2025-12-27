import { ArrowLeft, Phone, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header = ({
  title,
  subtitle,
  showBack = false,
  showEmergency = false,
  icon: Icon,
}) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <header
      className="bg-blue-950 px-4 py-3 sticky top-0 z-50 border-b-2 border-white"
      data-testid="header"
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logome.webp"
            alt="MDRRMO"
            className="w-10 h-10 object-contain"
            data-testid="header-logo"
          />

          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-400 transition-colors"
              data-testid="back-button"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 text-blue-950" />
            </button>
          ) : null}

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1
                className="text-yellow-500 font-bold text-lg md:text-xl tracking-wide truncate"
                data-testid="header-title"
              >
                {title}
              </h1>
              {Icon ? <Icon className="w-6 h-6 text-yellow-500" /> : null}
            </div>
            {subtitle ? (
              <p className="text-white text-xs md:text-sm mt-0.5 truncate" data-testid="header-subtitle">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {showEmergency ? (
          <button
            onClick={() => navigate('/hotlines')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg"
            data-testid="emergency-911-btn"
            type="button"
          >
            <Phone className="w-5 h-5" />
            Emergency Call 911
          </button>
        ) : isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full">
              <UserIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-medium truncate max-w-[100px]">
                {user.full_name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
              data-testid="logout-btn"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export const TopNav = ({ subtitle }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="bg-blue-950 px-4 py-4 border-b-2 border-white" data-testid="top-nav">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="/logome.webp" 
            alt="MDRRMO Logo" 
            className="w-12 h-12 object-contain"
            data-testid="top-nav-logo"
          />
          <div>
            <h1 className="text-yellow-500 font-bold text-xl md:text-2xl tracking-wide">
              MDRRMO PIO DURAN
            </h1>
            {subtitle && (
              <p className="text-white text-xs md:text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-full">
              <UserIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-500 text-sm font-medium">
                {user.full_name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
              data-testid="logout-btn-topnav"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-semibold px-4 py-2 rounded-full transition-colors text-sm"
            data-testid="login-btn-topnav"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};
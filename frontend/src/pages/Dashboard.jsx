import { useNavigate } from 'react-router-dom';
import { TopNav } from '../components/Header';
import { 
  Phone, 
  AlertTriangle, 
  Cloud, 
  Map, 
  Briefcase, 
  BookOpen, 
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const modules = [
  {
    title: 'Report an Incident',
    icon: AlertTriangle,
    route: '/report-incident',
    description: 'Submit incident report',
  },
  {
    title: 'Typhoon Dashboard',
    icon: Cloud,
    route: '/typhoon-dashboard',
    description: 'Live monitoring',
  },
  {
    title: 'Interactive Map',
    icon: Map,
    route: '/interactive-map',
    description: 'Evacuation centers',
  },
  {
    title: 'Go Bag Checklist',
    icon: Briefcase,
    route: '/go-bag-checklist',
    description: 'Emergency kit items',
  },
  {
    title: 'Support Resources',
    icon: BookOpen,
    route: '/support-resources',
    description: 'Help & information',
  },
  {
    title: 'Emergency Plan',
    icon: FileText,
    route: '/emergency-plan',
    description: 'Family safety plan',
  },
];

const adminModule = {
  title: 'Admin Dashboard',
  icon: Shield,
  route: '/admin',
  description: 'Manage incidents & hotlines',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-900 pb-20" data-testid="dashboard">
      <TopNav subtitle="Public Preparedness for Disaster" />
      
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* 24/7 Hotline Numbers Banner */}
        <button
          onClick={() => navigate('/hotlines')}
          className="w-full bg-yellow-500 hover:bg-yellow-400 rounded-2xl p-5 mb-6 flex items-center justify-center gap-3 transition-all shadow-lg"
          data-testid="hotline-banner"
        >
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">24/7</span>
            <h2 className="text-blue-950 font-bold text-xl tracking-wide" data-testid="hotline-title">
              HOTLINE NUMBERS
            </h2>
          </div>
        </button>

        {/* Module Grid */}
        <div className="grid grid-cols-2 gap-4" data-testid="modules-grid">
          {[...modules, ...(user?.is_admin ? [adminModule] : [])].map((module) => (
            <button
              key={module.title}
              onClick={() => navigate(module.route)}
              className="module-card bg-white rounded-2xl p-4 card-yellow-border flex flex-col items-center justify-center min-h-[140px] hover:bg-slate-50 transition-all"
              data-testid={`module-${module.route.slice(1)}`}
            >
              <div className="w-14 h-14 rounded-full bg-blue-950/10 flex items-center justify-center mb-3">
                <module.icon className="w-7 h-7 text-blue-950" />
              </div>
              <h3 className="text-blue-950 font-bold text-sm text-center leading-tight">
                {module.title}
              </h3>
              <p className="text-slate-500 text-xs mt-1 text-center">
                {module.description}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

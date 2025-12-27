import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Phone, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const getCategoryColor = (category) => {
  const colors = {
    emergency: 'bg-red-500',
    local: 'bg-blue-500',
    police: 'bg-blue-700',
    fire: 'bg-orange-500',
    medical: 'bg-green-500',
    weather: 'bg-cyan-500',
    social: 'bg-purple-500',
  };
  return colors[category] || 'bg-slate-500';
};

export default function HotlineNumbers() {
  const [hotlines, setHotlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleCall = (number) => {
    const cleanNumber = String(number || '').replace(/\s/g, '');
    window.open(`tel:${cleanNumber}`, '_self');
  };

  const fetchHotlines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/hotlines');
      setHotlines(res.data.hotlines || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load hotlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotlines();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900" data-testid="hotlines-page">
      <Header title="HOTLINE NUMBERS" showBack icon={Phone} />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <p className="text-white/70 text-sm" data-testid="hotlines-subtitle">
            Tap a number to dial immediately
          </p>
          <button
            type="button"
            onClick={fetchHotlines}
            className="p-2 rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            data-testid="hotlines-refresh"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error ? (
          <div
            className="mt-4 bg-red-500/20 border border-red-500/30 text-red-100 text-sm rounded-xl p-3"
            data-testid="hotlines-error"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-4 space-y-3" data-testid="hotlines-list">
          {hotlines.map((hotline) => (
            <button
              key={hotline.id || `${hotline.label}-${hotline.number}`}
              onClick={() => handleCall(hotline.number)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors group"
              data-testid={`hotline-${String(hotline.id || hotline.number).replace(/\s/g, '-')}`}
              type="button"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${getCategoryColor(hotline.category)} flex items-center justify-center`}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate" data-testid={`hotline-label-${hotline.id || hotline.number}`}>
                    {hotline.label}
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5" data-testid={`hotline-number-${hotline.id || hotline.number}`}>
                    {hotline.number}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-yellow-500 transition-colors" />
            </button>
          ))}

          {!loading && hotlines.length === 0 ? (
            <div className="text-white/60 text-sm text-center py-10" data-testid="hotlines-empty">
              No hotline numbers available.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
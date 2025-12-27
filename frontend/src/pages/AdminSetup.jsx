import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Shield, User, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function AdminSetup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  });

  const onChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/admin/bootstrap', formData);
      const { access_token } = res.data;
      if (access_token) {
        localStorage.setItem('auth_token', access_token);
      }
      // Force a reload so AuthContext re-checks /api/auth/me with the new token
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950" data-testid="admin-setup-page">
      <Header title="ADMIN SETUP" showBack icon={Shield} />
      <main className="px-4 py-6 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-blue-950 font-bold text-xl" data-testid="admin-setup-title">Create First Admin</h2>
          <p className="text-slate-600 text-sm mt-1" data-testid="admin-setup-subtitle">
            One-time setup. This will only work if no admin user exists yet.
          </p>

          {error ? (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm" data-testid="admin-setup-error">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-4 space-y-4" data-testid="admin-setup-form">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  data-testid="admin-setup-full-name-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  data-testid="admin-setup-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={onChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  data-testid="admin-setup-phone-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={onChange}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  data-testid="admin-setup-password-input"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="admin-setup-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Create Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-600 text-sm hover:text-blue-950 transition-colors"
              data-testid="admin-setup-back-login"
              type="button"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

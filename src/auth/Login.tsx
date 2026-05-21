import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const roleHome: Record<string, string> = {
  superadmin: '/sa',
  distributor: '/dist',
  owner: '/own',
  restaurant: '/rst',
};

const DEMO_CREDS = [
  { role: 'Superadmin', email: 'admin@petpooja.com', password: 'admin123', color: 'bg-sa-600', desc: 'Full platform control' },
  { role: 'Distributor', email: 'north@petpooja.com', password: 'dist123', color: 'bg-dist-600', desc: 'North India territory' },
  { role: 'Owner', email: 'rajesh@spiceroute.com', password: 'owner123', color: 'bg-own-600', desc: 'Spice Route Hospitality (4 restaurants)' },
  { role: 'Restaurant', email: 'manager@spiceroute.com', password: 'rest123', color: 'bg-brand-600', desc: 'Spice Route Bandra — POS & ops' },
];

export default function Login() {
  const { user, login } = useAppStore();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={roleHome[user.role] || '/'} replace />;

  const handleLogin = async (e: string, p: string) => {
    setLoading(true); setError('');
    try {
      const data = await login(e, p);
      nav(roleHome[data.user.role] || '/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left branding */}
        <div className="text-white hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-xl">P</div>
            <div>
              <div className="text-2xl font-bold">Pet Pooja</div>
              <div className="text-slate-400 text-sm">Restaurant Management Platform</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Manage your entire restaurant empire from one place</h1>
          <p className="text-slate-400 mb-8">Superadmin · Distributor · Owner · Restaurant — all in one unified platform.</p>
          <div className="space-y-3">
            {DEMO_CREDS.map((d) => (
              <button key={d.role} onClick={() => handleLogin(d.email, d.password)} disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/10 text-left disabled:opacity-50">
                <span className={`w-8 h-8 rounded-lg ${d.color} flex items-center justify-center text-white font-bold text-xs`}>{d.role.charAt(0)}</span>
                <div>
                  <div className="font-medium text-sm">{d.role}</div>
                  <div className="text-xs text-slate-400">{d.desc}</div>
                </div>
                <span className="ml-auto text-xs text-slate-500">{d.email}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-500">All demo passwords: admin123 / dist123 / owner123 / rest123</div>
        </div>

        {/* Right form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-sm">P</div>
            <div className="font-bold text-slate-900">Pet Pooja Platform</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your credentials or use a demo account →</p>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="your@email.com" type="email" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" type="password" required />
            </div>
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div className="mt-6 lg:hidden">
            <div className="text-xs text-slate-500 mb-3 font-medium">Quick demo login:</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDS.map((d) => (
                <button key={d.role} onClick={() => handleLogin(d.email, d.password)} disabled={loading}
                  className={`${d.color} text-white text-xs rounded-lg px-3 py-2 font-medium disabled:opacity-50`}>{d.role}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

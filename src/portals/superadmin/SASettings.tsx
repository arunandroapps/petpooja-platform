import { useAppStore } from '../../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';

const DEMO_CREDS = [
  { role: 'Superadmin', email: 'admin@petpooja.com', password: 'admin123' },
  { role: 'Distributor (North)', email: 'north@petpooja.com', password: 'dist123' },
  { role: 'Distributor (West)', email: 'west@petpooja.com', password: 'dist123' },
  { role: 'Owner (Spice Route)', email: 'rajesh@spiceroute.com', password: 'owner123' },
  { role: 'Owner (Delhi Bites)', email: 'priya@delhibites.com', password: 'owner123' },
  { role: 'Restaurant (Bandra)', email: 'manager@spiceroute.com', password: 'rest123' },
  { role: 'Restaurant (Andheri)', email: 'andheri@spiceroute.com', password: 'rest123' },
  { role: 'Restaurant (Delhi CP)', email: 'manager@delhibites.com', password: 'rest123' },
];

export default function SASettings() {
  const { user } = useAppStore();
  const { data: overview } = useQuery({ queryKey: ['sa-overview'], queryFn: saAPI.getOverview });

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader title="Platform Settings" />
      <div className="space-y-4">
        <div className="card p-5">
          <div className="font-semibold mb-3">Logged In As</div>
          <div className="text-sm space-y-1">
            <div><span className="text-slate-500">Name:</span> {user?.name}</div>
            <div><span className="text-slate-500">Email:</span> {user?.email}</div>
            <div><span className="text-slate-500">Role:</span> <span className="capitalize font-medium text-sa-600">{user?.role}</span></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-3">Platform Stats</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-slate-50 rounded"><div className="text-slate-500 text-xs">Active Distributors</div><div className="font-bold text-lg">{overview?.distributors || 0}</div></div>
            <div className="p-3 bg-slate-50 rounded"><div className="text-slate-500 text-xs">Active Owners</div><div className="font-bold text-lg">{overview?.owners || 0}</div></div>
            <div className="p-3 bg-slate-50 rounded"><div className="text-slate-500 text-xs">Active Restaurants</div><div className="font-bold text-lg">{overview?.activeRestaurants || 0}</div></div>
            <div className="p-3 bg-slate-50 rounded"><div className="text-slate-500 text-xs">MRR</div><div className="font-bold text-lg">₹{(overview?.mrr || 0).toLocaleString()}</div></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-3">Demo Credentials (Live DB)</div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-1">Role</th><th className="text-left py-1">Email</th><th className="text-left py-1">Password</th></tr></thead>
            <tbody>
              {DEMO_CREDS.map(c => (
                <tr key={c.email} className="border-t border-slate-100">
                  <td className="py-1.5 font-medium">{c.role}</td>
                  <td className="py-1.5 text-slate-600">{c.email}</td>
                  <td className="py-1.5 font-mono text-slate-400">{c.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

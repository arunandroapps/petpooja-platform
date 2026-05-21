import { useQuery } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import StatCard from '../../components/StatCard';
import { IndianRupee, Network, Building2, Store, AlertCircle } from 'lucide-react';
import { fmtMoney, fmtDate } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SADashboard() {
  const { data: overview } = useQuery({ queryKey: ['sa-overview'], queryFn: saAPI.getOverview });
  const { data: byDist } = useQuery({ queryKey: ['sa-rev-by-dist'], queryFn: saAPI.getRevByDistributor });
  const { data: rsts } = useQuery({ queryKey: ['sa-restaurants'], queryFn: saAPI.getRestaurants });
  const { data: tickets } = useQuery({ queryKey: ['sa-tickets-open'], queryFn: () => saAPI.getTickets('open') });

  const distData = (byDist || []).map((d: any) => ({ name: d.region?.split(' ')[0], owners: d.ownerCount, commission: Math.round(d.commission / 100) }));
  const topRsts = [...(rsts || [])].sort((a: any, b: any) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500">Real-time across all distributors, owners & restaurants</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Recurring Revenue" value={fmtMoney(overview?.mrr || 0)} delta="Platform MRR" Icon={IndianRupee} color="bg-sa-600" />
        <StatCard label="Active Distributors" value={overview?.distributors || 0} Icon={Network} color="bg-dist-600" />
        <StatCard label="Active Owners" value={overview?.owners || 0} Icon={Building2} color="bg-own-600" />
        <StatCard label="Active Restaurants" value={overview?.activeRestaurants || 0} sub={`${(overview?.totalRestaurants || 0) - (overview?.activeRestaurants || 0)} pending`} Icon={Store} color="bg-brand-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Distributor Performance</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="owners" fill="#0ea5e9" name="Owners" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-3">Open Support Tickets</div>
          {(!tickets || tickets.length === 0) && <div className="text-sm text-slate-400 py-8 text-center">No open tickets 🎉</div>}
          <div className="space-y-2">
            {(tickets || []).slice(0, 4).map((t: any) => (
              <div key={t._id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{t.subject}</div>
                    <div className="text-xs text-slate-500">{t.fromName} · {fmtDate(t.createdAt)}</div>
                  </div>
                  <span className={`badge ${t.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Top Restaurants by Revenue</div>
        <div className="space-y-2">
          {topRsts.map((r: any, i: number) => (
            <div key={r._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-slate-500">{r.city} · {r.type}</div>
              </div>
              <div className="text-sm font-semibold">{fmtMoney(r.totalRevenue || 0)}</div>
              <span className={`badge ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

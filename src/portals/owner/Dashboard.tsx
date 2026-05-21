import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import StatCard from '../../components/StatCard';
import { Store, IndianRupee, ReceiptText } from 'lucide-react';
import { fmtMoney, fmtDate } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function OwnDashboard() {
  const { data: owner } = useQuery({ queryKey: ['owner-me'], queryFn: ownerAPI.me });
  const { data: restaurants = [] } = useQuery({ queryKey: ['owner-restaurants'], queryFn: ownerAPI.getRestaurants });
  const { data: analytics } = useQuery({ queryKey: ['owner-analytics'], queryFn: () => ownerAPI.getAnalytics(7) });

  const plan = owner?.planId as any;
  const daysLeft = owner ? Math.ceil((new Date(owner.subscriptionEnd).getTime() - Date.now()) / 86400000) : 0;
  const byBranch = (analytics?.byBranch || []).map((b: any) => {
    const rst = (restaurants as any[]).find(r => r._id === b._id?.toString() || r._id === b._id);
    return { name: rst?.name?.split('—').pop()?.trim() || 'Branch', revenue: Math.round(b.revenue / 1000) };
  });

  const totalRevenue = (analytics?.byBranch || []).reduce((a: number, b: any) => a + b.revenue, 0);
  const totalOrders = (analytics?.byBranch || []).reduce((a: number, b: any) => a + b.orders, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{owner?.businessName}</h1>
          <p className="text-sm text-slate-500">{owner?.city}, {owner?.state} · {(restaurants as any[]).length} branches</p>
        </div>
        {plan && (
          <div className="text-right">
            <span className="badge" style={{ background: plan.color + '20', color: plan.color }}>{plan.name} Plan</span>
            <div className={`text-xs mt-1 ${daysLeft < 7 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-slate-500'}`}>Renews in {daysLeft}d</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Active Branches" value={(restaurants as any[]).filter((r: any) => r.status === 'active').length} sub={`${(restaurants as any[]).length} total`} Icon={Store} color="bg-brand-600" />
        <StatCard label="7-day Revenue" value={fmtMoney(totalRevenue)} Icon={IndianRupee} color="bg-own-600" />
        <StatCard label="7-day Orders" value={totalOrders} Icon={ReceiptText} color="bg-dist-600" />
      </div>

      {byBranch.length > 0 && (
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Revenue by Branch (₹K)</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={byBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹K)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Branch Summary</div>
        {(restaurants as any[]).map((r: any) => (
          <div key={r._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <div className="text-sm font-medium">{r.name}</div>
              <div className="text-xs text-slate-500">{r.type} · {r.city}</div>
            </div>
            <span className={`badge ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

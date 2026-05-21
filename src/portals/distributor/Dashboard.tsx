import { useQuery } from '@tanstack/react-query';
import { distAPI } from '../../api/distributor';
import StatCard from '../../components/StatCard';
import { Building2, Store, IndianRupee, TrendingUp } from 'lucide-react';
import { fmtMoney, fmtDate } from '../../utils/format';

export default function DistDashboard() {
  const { data: dist } = useQuery({ queryKey: ['dist-me'], queryFn: distAPI.me });
  const { data: owners = [] } = useQuery({ queryKey: ['dist-owners'], queryFn: distAPI.getOwners });
  const { data: restaurants = [] } = useQuery({ queryKey: ['dist-restaurants'], queryFn: distAPI.getRestaurants });
  const { data: commission } = useQuery({ queryKey: ['dist-commission'], queryFn: distAPI.getCommission });

  const pendingOwners = (owners as any[]).filter(o => o.status === 'pending');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {dist?.name}</h1>
        <p className="text-sm text-slate-500">{dist?.region} · {dist?.commissionPct}% commission</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Owners" value={(owners as any[]).filter(o => o.status === 'active').length} sub={`${pendingOwners.length} pending`} Icon={Building2} color="bg-dist-600" />
        <StatCard label="My Restaurants" value={(restaurants as any[]).filter(r => r.status === 'active').length} Icon={Store} color="bg-own-600" />
        <StatCard label="Subscription Revenue" value={fmtMoney(commission?.subscriptionRevenue || 0)} Icon={IndianRupee} color="bg-brand-600" />
        <StatCard label="My Commission" value={fmtMoney(commission?.commission || 0)} delta={`${dist?.commissionPct}% rate`} Icon={TrendingUp} color="bg-emerald-500" />
      </div>
      {pendingOwners.length > 0 && (
        <div className="card p-4 border-l-4 border-amber-400">
          <div className="font-semibold text-amber-700 mb-2">Pending Approvals ({pendingOwners.length})</div>
          {pendingOwners.map((o: any) => (
            <div key={o._id} className="flex items-center justify-between text-sm p-2 bg-amber-50 rounded mb-1">
              <span>{o.businessName} · {o.name}</span>
              <span className="text-slate-500">{fmtDate(new Date(o.createdAt).getTime())}</span>
            </div>
          ))}
        </div>
      )}
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">My Owners — Performance</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">Owner</th><th className="text-left py-2">Plan</th><th className="text-center py-2">Restaurants</th><th className="text-center py-2">Status</th></tr></thead>
          <tbody>
            {(owners as any[]).map(o => (
              <tr key={o._id} className="border-t border-slate-100">
                <td className="py-2"><div className="font-medium">{o.businessName}</div><div className="text-xs text-slate-500">{o.name}</div></td>
                <td className="py-2"><span className="badge bg-slate-100 text-slate-600">{o.planId?.name}</span></td>
                <td className="py-2 text-center">{(restaurants as any[]).filter(r => r.ownerId?._id === o._id || r.ownerId === o._id).length}</td>
                <td className="py-2 text-center"><span className={`badge ${o.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

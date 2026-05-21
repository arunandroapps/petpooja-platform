import { usePlatform } from '../../store/usePlatform';
import StatCard from '../../components/StatCard';
import { Building2, Store, IndianRupee, TrendingUp } from 'lucide-react';
import { fmtMoney, fmtDate } from '../../utils/format';

export default function DistDashboard() {
  const { currentUser, distributors, owners, restaurants, plans } = usePlatform();
  const dist = distributors.find(d=>d.id===currentUser?.entityId);
  if(!dist) return null;
  const myOwners = owners.filter(o=>o.distributorId===dist.id);
  const myOwnerIds = myOwners.map(o=>o.id);
  const myRsts = restaurants.filter(r=>myOwnerIds.includes(r.ownerId));
  const totalRev = myRsts.reduce((a,r)=>a+r.totalRevenue,0);
  const commissionEarned = totalRev * dist.commissionPct / 100;
  const pendingOwners = myOwners.filter(o=>o.status==='pending');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {dist.name}</h1>
        <p className="text-sm text-slate-500">{dist.region} · {dist.commissionPct}% commission on all subscriptions</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Owners" value={myOwners.filter(o=>o.status==='active').length} sub={`${pendingOwners.length} pending`} Icon={Building2} color="bg-dist-600"/>
        <StatCard label="My Restaurants" value={myRsts.filter(r=>r.status==='active').length} Icon={Store} color="bg-own-600"/>
        <StatCard label="Platform Revenue (My Territory)" value={fmtMoney(totalRev)} Icon={IndianRupee} color="bg-brand-600"/>
        <StatCard label="My Commission Earned" value={fmtMoney(commissionEarned)} delta={`${dist.commissionPct}% of territory revenue`} Icon={TrendingUp} color="bg-emerald-500"/>
      </div>

      {pendingOwners.length>0&&(
        <div className="card p-4 border-l-4 border-amber-400">
          <div className="font-semibold text-amber-700 mb-2">Pending Owner Approvals ({pendingOwners.length})</div>
          <div className="space-y-1">
            {pendingOwners.map(o=>(
              <div key={o.id} className="flex items-center justify-between text-sm p-2 bg-amber-50 rounded">
                <span>{o.businessName} · {o.name}</span>
                <span className="text-slate-500">{fmtDate(o.joinedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">My Owners — Performance</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">Owner / Business</th><th className="text-left py-2">Plan</th><th className="text-center py-2">Restaurants</th><th className="text-right py-2">Revenue</th><th className="text-center py-2">Status</th></tr></thead>
          <tbody>
            {myOwners.map(o=>{
              const plan=plans.find(p=>p.id===o.planId);
              return(<tr key={o.id} className="border-t border-slate-100">
                <td className="py-2"><div className="font-medium">{o.businessName}</div><div className="text-xs text-slate-500">{o.name}</div></td>
                <td className="py-2"><span className="badge bg-slate-100 text-slate-600">{plan?.name}</span></td>
                <td className="py-2 text-center">{o.totalRestaurants}</td>
                <td className="py-2 text-right font-semibold">{fmtMoney(o.totalRevenue)}</td>
                <td className="py-2 text-center"><span className={`badge ${o.status==='active'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{o.status}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

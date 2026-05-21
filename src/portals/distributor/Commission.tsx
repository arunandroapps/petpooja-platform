import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DistCommission() {
  const { currentUser, distributors, owners, restaurants, plans } = usePlatform();
  const dist = distributors.find(d=>d.id===currentUser?.entityId);
  if(!dist) return null;
  const myOwners = owners.filter(o=>o.distributorId===dist.id);
  const myOwnerIds = myOwners.map(o=>o.id);
  const myRsts = restaurants.filter(r=>myOwnerIds.includes(r.ownerId));

  const subRevenue = myOwners.filter(o=>o.status==='active').reduce((a,o)=>{const p=plans.find(pl=>pl.id===o.planId);return a+(p?.price||0);},0);
  const commissionOnSubs = subRevenue * dist.commissionPct / 100;
  const totalRestRev = myRsts.reduce((a,r)=>a+r.totalRevenue,0);

  const byOwner = myOwners.map(o=>{
    const rsts=restaurants.filter(r=>r.ownerId===o.id);
    const rev=rsts.reduce((a,r)=>a+r.totalRevenue,0);
    const plan=plans.find(p=>p.id===o.planId);
    const subAmt=plan?.price||0;
    return { name:o.businessName.split(' ').slice(0,2).join(' '), subscriptionRevenue:subAmt, restaurantRevenue:rev, commission:subAmt*dist.commissionPct/100 };
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Commission Tracker" subtitle={`${dist.commissionPct}% on subscription revenue`}/>
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-xs text-slate-500 uppercase">Total Subscription Revenue</div>
          <div className="text-2xl font-bold mt-1">{fmtMoney(subRevenue)}/mo</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 uppercase">My Commission (Subs)</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{fmtMoney(commissionOnSubs)}/mo</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 uppercase">Territory Restaurant Revenue</div>
          <div className="text-2xl font-bold mt-1">{fmtMoney(totalRestRev)}</div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Commission by Owner</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={byOwner}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="name" fontSize={12} stroke="#94a3b8"/>
              <YAxis fontSize={12} stroke="#94a3b8"/>
              <Tooltip/>
              <Bar dataKey="commission" fill="#0ea5e9" name="Commission ₹" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Detailed Breakdown</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr>
            <th className="text-left py-2">Owner</th>
            <th className="text-left py-2">Plan</th>
            <th className="text-right py-2">Plan Revenue</th>
            <th className="text-right py-2">Commission ({dist.commissionPct}%)</th>
          </tr></thead>
          <tbody>
            {myOwners.filter(o=>o.status==='active').map(o=>{
              const plan=plans.find(p=>p.id===o.planId);
              return(<tr key={o.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{o.businessName}</td>
                <td className="py-2"><span className="badge bg-slate-100 text-slate-600">{plan?.name}</span></td>
                <td className="py-2 text-right">{fmtMoney(plan?.price||0)}</td>
                <td className="py-2 text-right font-semibold text-emerald-600">{fmtMoney((plan?.price||0)*dist.commissionPct/100)}</td>
              </tr>);
            })}
            <tr className="border-t-2 border-slate-300 font-bold">
              <td className="py-2" colSpan={2}>Total</td>
              <td className="py-2 text-right">{fmtMoney(subRevenue)}</td>
              <td className="py-2 text-right text-emerald-600">{fmtMoney(commissionOnSubs)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

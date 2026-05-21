import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';

export default function DistRestaurants() {
  const { currentUser, distributors, owners, restaurants } = usePlatform();
  const dist = distributors.find(d=>d.id===currentUser?.entityId);
  const myOwnerIds = owners.filter(o=>o.distributorId===dist?.id).map(o=>o.id);
  const myRsts = restaurants.filter(r=>myOwnerIds.includes(r.ownerId));
  return (
    <div className="p-6">
      <PageHeader title="Restaurants in My Territory" subtitle={`${myRsts.length} restaurants across ${owners.filter(o=>o.distributorId===dist?.id).length} owners`}/>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>
            <th className="text-left px-4 py-3">Restaurant</th>
            <th className="text-left px-4 py-3">Owner</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-right px-4 py-3">Tables</th>
            <th className="text-right px-4 py-3">Orders</th>
            <th className="text-right px-4 py-3">Revenue</th>
            <th className="text-center px-4 py-3">Status</th>
          </tr></thead>
          <tbody>
            {myRsts.map(r=>{
              const owner=owners.find(o=>o.id===r.ownerId);
              return(<tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-medium">{r.name}</div><div className="text-xs text-slate-500">{r.city}</div></td>
                <td className="px-4 py-3 text-slate-600 text-xs">{owner?.businessName}</td>
                <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{r.type}</span></td>
                <td className="px-4 py-3 text-right">{r.totalTables}</td>
                <td className="px-4 py-3 text-right">{r.totalOrders.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmtMoney(r.totalRevenue)}</td>
                <td className="px-4 py-3 text-center"><span className={`badge ${r.status==='active'?'bg-emerald-100 text-emerald-700':r.status==='pending'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{r.status}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

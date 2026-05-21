import { useState } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';

export default function SARestaurants() {
  const s = usePlatform();
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const filtered = s.restaurants.filter(r=>
    (statusF==='all'||r.status===statusF)&&
    (r.name.toLowerCase().includes(search.toLowerCase())||r.city.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="p-6">
      <PageHeader title="All Restaurants" subtitle={`${s.restaurants.length} total across all owners`}/>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="input pl-9" placeholder="Search restaurants..."/>
        </div>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="input w-36">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Restaurant</th>
              <th className="text-left px-4 py-3">Owner</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-center px-4 py-3">Tables</th>
              <th className="text-right px-4 py-3">Orders</th>
              <th className="text-right px-4 py-3">Revenue</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>{
              const owner=s.owners.find(o=>o.id===r.ownerId);
              return(
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-slate-500">{r.city} · {r.address?.split(',')[0]}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{owner?.businessName||'—'}<div className="text-slate-400">{owner?.name}</div></td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{r.type}</span></td>
                  <td className="px-4 py-3 text-center">{r.totalTables}</td>
                  <td className="px-4 py-3 text-right">{r.totalOrders.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtMoney(r.totalRevenue)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${r.status==='active'?'bg-emerald-100 text-emerald-700':r.status==='pending'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status==='pending'&&<button onClick={()=>s.updateRestaurantStatus(r.id,'active')} className="p-1 text-emerald-500"><CheckCircle size={14}/></button>}
                    {r.status==='active'&&<button onClick={()=>s.updateRestaurantStatus(r.id,'inactive')} className="p-1 text-red-500"><XCircle size={14}/></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

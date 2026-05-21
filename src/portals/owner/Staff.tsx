import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';

export default function OwnStaff() {
  const { currentUser, owners, restaurants, staff } = usePlatform();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  const myRstIds = restaurants.filter(r=>r.ownerId===owner?.id).map(r=>r.id);
  const myStaff = staff.filter(s=>myRstIds.includes(s.restaurantId));
  const roleColors: Record<string,string>={manager:'bg-purple-100 text-purple-700',cashier:'bg-emerald-100 text-emerald-700',waiter:'bg-amber-100 text-amber-700',chef:'bg-red-100 text-red-700'};
  return (
    <div className="p-6">
      <PageHeader title="Staff Across All Branches" subtitle={`${myStaff.length} total staff members`}/>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Staff</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Branch</th><th className="text-left px-4 py-3">Phone</th><th className="text-center px-4 py-3">Status</th></tr></thead>
          <tbody>
            {myStaff.map(s=>{
              const rst=restaurants.find(r=>r.id===s.restaurantId);
              return(<tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3"><span className={`badge ${roleColors[s.role]||'bg-slate-100 text-slate-600'} capitalize`}>{s.role}</span></td>
                <td className="px-4 py-3 text-slate-600 text-xs">{rst?.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                <td className="px-4 py-3 text-center"><span className={`badge ${s.active?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{s.active?'Active':'Inactive'}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

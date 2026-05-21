import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import PageHeader from '../../components/PageHeader';

const roleColors: Record<string, string> = { manager: 'bg-purple-100 text-purple-700', cashier: 'bg-emerald-100 text-emerald-700', waiter: 'bg-amber-100 text-amber-700', chef: 'bg-red-100 text-red-700', delivery: 'bg-cyan-100 text-cyan-700' };

export default function OwnStaff() {
  const { data: staff = [], isLoading } = useQuery({ queryKey: ['owner-staff'], queryFn: ownerAPI.getStaff });
  const { data: restaurants = [] } = useQuery({ queryKey: ['owner-restaurants'], queryFn: ownerAPI.getRestaurants });

  return (
    <div className="p-6">
      <PageHeader title="Staff Across All Branches" subtitle={`${(staff as any[]).length} total`} />
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Staff</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Branch</th><th className="text-left px-4 py-3">Phone</th><th className="text-center px-4 py-3">Status</th></tr></thead>
          <tbody>
            {(staff as any[]).map(s => {
              const rst = (restaurants as any[]).find(r => r._id === s.restaurantId?._id || r._id === s.restaurantId);
              return (
                <tr key={s._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3"><span className={`badge ${roleColors[s.role] || 'bg-slate-100 text-slate-600'} capitalize`}>{s.role}</span></td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{rst?.name || s.restaurantId?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                  <td className="px-4 py-3 text-center"><span className={`badge ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

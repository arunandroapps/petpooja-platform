import { useQuery } from '@tanstack/react-query';
import { distAPI } from '../../api/distributor';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';

export default function DistRestaurants() {
  const { data: restaurants = [], isLoading } = useQuery({ queryKey: ['dist-restaurants'], queryFn: distAPI.getRestaurants });
  const { data: owners = [] } = useQuery({ queryKey: ['dist-owners'], queryFn: distAPI.getOwners });

  return (
    <div className="p-6">
      <PageHeader title="Restaurants in My Territory" subtitle={`${(restaurants as any[]).length} restaurants`} />
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Restaurant</th><th className="text-left px-4 py-3">Owner</th><th className="text-left px-4 py-3">Type</th><th className="text-center px-4 py-3">Status</th></tr></thead>
          <tbody>
            {(restaurants as any[]).map(r => {
              const owner = (owners as any[]).find(o => o._id === r.ownerId?._id || o._id === r.ownerId);
              return (
                <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="font-medium">{r.name}</div><div className="text-xs text-slate-500">{r.city}</div></td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.ownerId?.businessName || owner?.businessName}</td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{r.type}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`badge ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

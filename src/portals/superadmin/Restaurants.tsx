import { useState } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';

export default function SARestaurants() {
  const qc = useQueryClient();
  const { data: restaurants = [], isLoading } = useQuery({ queryKey: ['sa-restaurants'], queryFn: saAPI.getRestaurants });
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const setStatus = useMutation({ mutationFn: ({ id, status }: any) => saAPI.updateRestaurantStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-restaurants'] }) });

  const filtered = (restaurants as any[]).filter(r =>
    (statusF === 'all' || r.status === statusF) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.city?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      <PageHeader title="All Restaurants" subtitle={`${(restaurants as any[]).length} total`} />
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search..." /></div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="input w-36"><option value="all">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select>
      </div>
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Restaurant</th><th className="text-left px-4 py-3">Owner</th><th className="text-left px-4 py-3">Type</th><th className="text-center px-4 py-3">Status</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-medium">{r.name}</div><div className="text-xs text-slate-500">{r.city} · {r.address?.split(',')[0]}</div></td>
                <td className="px-4 py-3 text-xs text-slate-600">{r.ownerId?.businessName || '—'}<div className="text-slate-400">{r.ownerId?.name}</div></td>
                <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{r.type}</span></td>
                <td className="px-4 py-3 text-center"><span className={`badge ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span></td>
                <td className="px-4 py-3">
                  {r.status === 'pending' && <button onClick={() => setStatus.mutate({ id: r._id, status: 'active' })} className="p-1 text-emerald-500"><CheckCircle size={14} /></button>}
                  {r.status === 'active' && <button onClick={() => setStatus.mutate({ id: r._id, status: 'inactive' })} className="p-1 text-red-500"><XCircle size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

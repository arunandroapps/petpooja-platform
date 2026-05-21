import { useState } from 'react';
import { Plus, Edit2, CheckCircle, XCircle, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtDate } from '../../utils/format';

const emptyOwner = { name: '', email: '', phone: '', businessName: '', city: '', state: '', distributorId: '', planId: '' };

export default function SAOwners() {
  const qc = useQueryClient();
  const { data: owners = [] } = useQuery({ queryKey: ['sa-owners'], queryFn: saAPI.getOwners });
  const { data: distributors = [] } = useQuery({ queryKey: ['sa-distributors'], queryFn: saAPI.getDistributors });
  const { data: plans = [] } = useQuery({ queryKey: ['sa-plans'], queryFn: saAPI.getPlans });
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const create = useMutation({ mutationFn: saAPI.createOwner, onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['sa-owners'] }); setEditing(null); alert(`Created! ${d.credentials?.email} / ${d.credentials?.password}`); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => saAPI.updateOwner(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-owners'] }); setEditing(null); } });
  const setStatus = useMutation({ mutationFn: ({ id, status }: any) => saAPI.updateOwnerStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-owners'] }) });

  const filtered = (owners as any[]).filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.businessName.toLowerCase().includes(search.toLowerCase()));
  const save = () => { if (!editing) return; editing._id ? update.mutate({ id: editing._id, body: editing }) : create.mutate(editing); };

  return (
    <div className="p-6">
      <PageHeader title="Restaurant Owners" subtitle={`${(owners as any[]).length} total`}
        actions={<button onClick={() => setEditing({ ...emptyOwner, distributorId: (distributors as any[])[0]?._id, planId: (plans as any[])[0]?._id })} className="btn-sa"><Plus size={16} />Add Owner</button>} />
      <div className="relative max-w-sm mb-4"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search owners..." /></div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Owner</th><th className="text-left px-4 py-3">Distributor</th><th className="text-left px-4 py-3">Plan</th><th className="text-left px-4 py-3">Subscription</th><th className="text-center px-4 py-3">Status</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {filtered.map((o: any) => {
              const daysLeft = Math.ceil((new Date(o.subscriptionEnd).getTime() - Date.now()) / 86400000);
              return (
                <tr key={o._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="font-medium">{o.name}</div><div className="text-xs text-slate-500">{o.businessName} · {o.email}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{o.distributorId?.name || '—'}</td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{o.planId?.name}</span></td>
                  <td className="px-4 py-3 text-xs"><div>{fmtDate(new Date(o.subscriptionEnd).getTime())}</div><div className={`font-medium ${daysLeft < 7 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-emerald-600'}`}>{daysLeft}d left</div></td>
                  <td className="px-4 py-3 text-center"><span className={`badge ${o.status === 'active' ? 'bg-emerald-100 text-emerald-700' : o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{o.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing({ ...o, distributorId: o.distributorId?._id || o.distributorId, planId: o.planId?._id || o.planId })} className="p-1 text-slate-500 hover:text-sa-600"><Edit2 size={14} /></button>
                      {o.status === 'pending' && <button onClick={() => setStatus.mutate({ id: o._id, status: 'active' })} className="p-1 text-emerald-500"><CheckCircle size={14} /></button>}
                      {o.status === 'active' && <button onClick={() => setStatus.mutate({ id: o._id, status: 'suspended' })} className="p-1 text-red-500"><XCircle size={14} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Owner' : 'Add Owner'} size="lg"
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} disabled={create.isPending || update.isPending} className="btn-sa">Save</button></>}>
        {editing && <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Owner Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div><label className="label">Business Name</label><input value={editing.businessName} onChange={e => setEditing({ ...editing, businessName: e.target.value })} className="input" /></div>
          <div><label className="label">Email</label><input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="input" /></div>
          <div><label className="label">Phone</label><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="input" /></div>
          <div><label className="label">City</label><input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} className="input" /></div>
          <div><label className="label">State</label><input value={editing.state} onChange={e => setEditing({ ...editing, state: e.target.value })} className="input" /></div>
          <div><label className="label">Distributor</label><select value={editing.distributorId} onChange={e => setEditing({ ...editing, distributorId: e.target.value })} className="input">{(distributors as any[]).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div><label className="label">Plan</label><select value={editing.planId} onChange={e => setEditing({ ...editing, planId: e.target.value })} className="input">{(plans as any[]).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
        </div>}
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney, fmtDate } from '../../utils/format';

const empty = { name: '', email: '', phone: '', region: '', state: '', commissionPct: 10 };

export default function SADistributors() {
  const qc = useQueryClient();
  const { data: distributors = [], isLoading } = useQuery({ queryKey: ['sa-distributors'], queryFn: saAPI.getDistributors });
  const [editing, setEditing] = useState<any>(null);

  const create = useMutation({ mutationFn: saAPI.createDistributor, onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-distributors'] }); setEditing(null); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => saAPI.updateDistributor(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-distributors'] }); setEditing(null); } });
  const setStatus = useMutation({ mutationFn: ({ id, status }: any) => saAPI.updateDistributorStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-distributors'] }) });

  const save = () => {
    if (!editing) return;
    if (editing._id) update.mutate({ id: editing._id, body: editing });
    else create.mutate(editing);
  };

  return (
    <div className="p-6">
      <PageHeader title="Distributors" subtitle={`${distributors.length} total`}
        actions={<button onClick={() => setEditing(empty)} className="btn-sa"><Plus size={16} />Add Distributor</button>} />
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Distributor</th>
              <th className="text-left px-4 py-3">Region</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Commission %</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {distributors.map((d: any) => (
              <tr key={d._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.email} · {d.phone}</div>
                </td>
                <td className="px-4 py-3">{d.region}<div className="text-xs text-slate-500">{d.state}</div></td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge ${d.status === 'active' ? 'bg-emerald-100 text-emerald-700' : d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{d.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{d.commissionPct}%</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(d)} className="p-1 text-slate-500 hover:text-sa-600"><Edit2 size={14} /></button>
                    {d.status === 'pending' && <button onClick={() => setStatus.mutate({ id: d._id, status: 'active' })} className="p-1 text-emerald-500"><CheckCircle size={14} /></button>}
                    {d.status === 'active' && <button onClick={() => setStatus.mutate({ id: d._id, status: 'suspended' })} className="p-1 text-red-500"><XCircle size={14} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Distributor' : 'Add Distributor'}
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} disabled={create.isPending || update.isPending} className="btn-sa">Save</button></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
            <div><label className="label">Email</label><input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="input" /></div>
            <div><label className="label">Phone</label><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="input" /></div>
            <div><label className="label">Region</label><input value={editing.region} onChange={e => setEditing({ ...editing, region: e.target.value })} className="input" /></div>
            <div><label className="label">State</label><input value={editing.state} onChange={e => setEditing({ ...editing, state: e.target.value })} className="input" /></div>
            <div><label className="label">Commission %</label><input type="number" value={editing.commissionPct} onChange={e => setEditing({ ...editing, commissionPct: +e.target.value })} className="input" /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney, fmtDate } from '../../utils/format';

export default function RstCustomers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const { data, isLoading } = useQuery<any>({ queryKey: ['rst-customers', search], queryFn: () => rstAPI.getCustomers(search) });
  const customers = data?.customers || [];

  const create = useMutation({ mutationFn: rstAPI.createCustomer, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-customers'] }); setEditing(null); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => rstAPI.updateCustomer(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-customers'] }); setEditing(null); } });
  const del = useMutation({ mutationFn: rstAPI.deleteCustomer, onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-customers'] }) });

  const save = () => { if (!editing) return; editing._id ? update.mutate({ id: editing._id, body: editing }) : create.mutate(editing); };

  return (
    <div className="p-6">
      <PageHeader title="Customers" subtitle={`${data?.total || 0} total`}
        actions={<button onClick={() => setEditing({ name: '', phone: '', email: '' })} className="btn-primary"><Plus size={16} />Add Customer</button>} />
      <div className="relative max-w-sm mb-4"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="input pl-9" /></div>
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Customer</th><th className="text-right px-4 py-3">Visits</th><th className="text-right px-4 py-3">Spent</th><th className="text-right px-4 py-3">Loyalty</th><th className="text-left px-4 py-3">Last Visit</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-medium">{c.name}</div><div className="text-xs text-slate-500">{c.phone}</div></td>
                <td className="px-4 py-3 text-right">{c.visits}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmtMoney(c.totalSpent)}</td>
                <td className="px-4 py-3 text-right"><span className="badge bg-amber-100 text-amber-700"><Star size={10} />{c.loyaltyPoints}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.lastVisit ? fmtDate(new Date(c.lastVisit).getTime()) : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c)} className="text-slate-500 hover:text-brand-600 mr-2"><Edit2 size={14} /></button>
                  <button onClick={() => confirm('Delete?') && del.mutate(c._id)} className="text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Customer' : 'Add Customer'} size="sm"
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} disabled={create.isPending || update.isPending} className="btn-primary">Save</button></>}>
        {editing && <div className="space-y-3">
          <div><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div><label className="label">Phone</label><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="input" /></div>
          <div><label className="label">Email</label><input value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} className="input" /></div>
        </div>}
      </Modal>
    </div>
  );
}

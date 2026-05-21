import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import { useAppStore } from '../../store/useAppStore';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

const RST_TYPES = ['Fine Dining', 'Casual Dining', 'QSR', 'Cloud Kitchen', 'Cafe', 'Bakery', 'Bar & Grill'];

export default function OwnRestaurants() {
  const qc = useQueryClient();
  const { setActiveRestaurant } = useAppStore();
  const nav = useNavigate();
  const { data: owner } = useQuery({ queryKey: ['owner-me'], queryFn: ownerAPI.me });
  const { data: restaurants = [], isLoading } = useQuery({ queryKey: ['owner-restaurants'], queryFn: ownerAPI.getRestaurants });
  const [editing, setEditing] = useState<any>(null);

  const create = useMutation({
    mutationFn: ownerAPI.createRestaurant,
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['owner-restaurants'] }); setEditing(null); if (data.credentials) alert(`Created! Login: ${data.credentials.email} / ${data.credentials.password}`); },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: any) => ownerAPI.updateRestaurant(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-restaurants'] }); setEditing(null); },
  });

  const plan = owner?.planId as any;
  const canAdd = plan ? (restaurants as any[]).length < (plan.maxRestaurants === 999 ? Infinity : plan.maxRestaurants) : true;
  const save = () => { if (!editing) return; editing._id ? update.mutate({ id: editing._id, body: editing }) : create.mutate(editing); };

  return (
    <div className="p-6">
      <PageHeader title="My Restaurants" subtitle={`${(restaurants as any[]).length}/${plan?.maxRestaurants === 999 ? '∞' : plan?.maxRestaurants || '?'} branches`}
        actions={<button onClick={() => setEditing({ name: '', type: 'Casual Dining', phone: '', address: '', city: owner?.city || '' })} disabled={!canAdd} className="btn-own disabled:opacity-50"><Plus size={16} />Add Branch</button>} />
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(restaurants as any[]).map((r: any) => (
          <div key={r._id} className="card p-4 group relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-slate-500">{r.type} · {r.city}</div>
              </div>
              <span className={`badge ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
            </div>
            <div className="text-xs text-slate-500 mb-3">{r.address}</div>
            {r.status === 'active' && (
              <button onClick={() => { setActiveRestaurant(r._id); nav('/rst'); }} className="w-full btn-secondary text-xs">Open Restaurant POS →</button>
            )}
            <button onClick={() => setEditing(r)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-own-600"><Edit2 size={14} /></button>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Restaurant' : 'Add Restaurant'} size="lg"
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} disabled={create.isPending || update.isPending} className="btn-own">Save</button></>}>
        {editing && <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div><label className="label">Type</label><select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="input">{RST_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Phone</label><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="input" /></div>
          <div><label className="label">Email</label><input value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} className="input" /></div>
          <div><label className="label">City</label><input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} className="input" /></div>
          <div className="col-span-2"><label className="label">Address</label><input value={editing.address} onChange={e => setEditing({ ...editing, address: e.target.value })} className="input" /></div>
          <div><label className="label">GSTIN</label><input value={editing.gstin || ''} onChange={e => setEditing({ ...editing, gstin: e.target.value })} className="input" /></div>
        </div>}
      </Modal>
    </div>
  );
}

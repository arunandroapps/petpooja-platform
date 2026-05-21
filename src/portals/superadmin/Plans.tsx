import { useState } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney } from '../../utils/format';

export default function SAPlans() {
  const qc = useQueryClient();
  const { data: plans = [] } = useQuery({ queryKey: ['sa-plans'], queryFn: saAPI.getPlans });
  const [editing, setEditing] = useState<any>(null);
  const [featInput, setFeatInput] = useState('');

  const create = useMutation({ mutationFn: saAPI.createPlan, onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-plans'] }); setEditing(null); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => saAPI.updatePlan(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-plans'] }); setEditing(null); } });
  const del = useMutation({ mutationFn: saAPI.deletePlan, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-plans'] }) });

  const totalMRR = (plans as any[]).reduce((a: number, p: any) => a + (p.subscriberCount || 0) * p.price, 0);
  const save = () => {
    if (!editing) return;
    const body = { ...editing, features: featInput.split('\n').filter(Boolean) };
    editing._id ? update.mutate({ id: editing._id, body }) : create.mutate(body);
  };

  return (
    <div className="p-6">
      <PageHeader title="Plans & Billing" subtitle={`${(plans as any[]).length} plans · MRR ${fmtMoney(totalMRR)}`}
        actions={<button onClick={() => { setEditing({ name: '', tier: 'basic', price: 0, yearlyPrice: 0, maxRestaurants: 1, maxStaff: 5, color: '#6b7280' }); setFeatInput(''); }} className="btn-sa"><Plus size={16} />Add Plan</button>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(plans as any[]).map((p: any) => (
          <div key={p._id} className="card p-6 relative group">
            <div className="w-3 h-3 rounded-full mb-4" style={{ background: p.color }} />
            <div className="text-xl font-bold mb-1">{p.name}</div>
            <div className="text-3xl font-bold mb-0.5">{fmtMoney(p.price)}<span className="text-sm font-normal text-slate-500">/mo</span></div>
            <div className="text-xs text-slate-500 mb-4">{p.subscriberCount || 0} subscribers</div>
            <div className="space-y-2 mb-4">{(p.features || []).map((f: string, i: number) => <div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-500 shrink-0" />{f}</div>)}</div>
            <div className="text-xs text-slate-500">Max {p.maxRestaurants === 999 ? 'Unlimited' : p.maxRestaurants} restaurants</div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1">
              <button onClick={() => { setEditing(p); setFeatInput((p.features || []).join('\n')); }} className="p-1 text-slate-500 hover:text-sa-600"><Edit2 size={14} /></button>
              <button onClick={() => confirm('Delete?') && del.mutate(p._id)} className="p-1 text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Plan' : 'Add Plan'}
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} disabled={create.isPending || update.isPending} className="btn-sa">Save</button></>}>
        {editing && <div className="space-y-3">
          <div><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Monthly Price ₹</label><input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: +e.target.value })} className="input" /></div>
            <div><label className="label">Yearly Price ₹</label><input type="number" value={editing.yearlyPrice} onChange={e => setEditing({ ...editing, yearlyPrice: +e.target.value })} className="input" /></div>
            <div><label className="label">Max Restaurants</label><input type="number" value={editing.maxRestaurants} onChange={e => setEditing({ ...editing, maxRestaurants: +e.target.value })} className="input" /></div>
            <div><label className="label">Max Staff</label><input type="number" value={editing.maxStaff} onChange={e => setEditing({ ...editing, maxStaff: +e.target.value })} className="input" /></div>
            <div><label className="label">Color</label><input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="input h-10" /></div>
            <div><label className="label">Tier</label><select value={editing.tier} onChange={e => setEditing({ ...editing, tier: e.target.value })} className="input"><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
          </div>
          <div><label className="label">Features (one per line)</label><textarea value={featInput} onChange={e => setFeatInput(e.target.value)} className="input min-h-[100px]" /></div>
        </div>}
      </Modal>
    </div>
  );
}

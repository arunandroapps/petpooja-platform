import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { distAPI } from '../../api/distributor';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtDate } from '../../utils/format';

export default function DistOwners() {
  const qc = useQueryClient();
  const { data: owners = [] } = useQuery({ queryKey: ['dist-owners'], queryFn: distAPI.getOwners });
  const { data: plans = [] } = useQuery({ queryKey: ['sa-plans'], queryFn: saAPI.getPlans });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '', city: '', state: '', gst: '', planId: '' });

  const create = useMutation({
    mutationFn: distAPI.createOwner,
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['dist-owners'] }); setModal(false); alert(`Onboarded!\nEmail: ${data.credentials?.email}\nPassword: ${data.credentials?.password}`); },
  });

  return (
    <div className="p-6">
      <PageHeader title="My Owners" subtitle={`${(owners as any[]).length} in territory`}
        actions={<button onClick={() => setModal(true)} className="btn-dist"><Plus size={16} />Onboard Owner</button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(owners as any[]).map((o: any) => {
          const plan = o.planId;
          const daysLeft = Math.ceil((new Date(o.subscriptionEnd).getTime() - Date.now()) / 86400000);
          return (
            <div key={o._id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{o.businessName}</div>
                  <div className="text-xs text-slate-500">{o.name} · {o.city}</div>
                </div>
                <span className={`badge ${o.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              </div>
              <div className="text-xs text-slate-500 mb-3">{o.email}</div>
              <div className="flex items-center justify-between text-sm">
                {plan && <span className="badge" style={{ background: plan.color + '20', color: plan.color }}>{plan.name}</span>}
                <span className={`text-xs font-medium ${daysLeft < 7 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-slate-500'}`}>{daysLeft}d left</span>
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Onboard New Owner" size="lg"
        footer={<><button onClick={() => setModal(false)} className="btn-secondary">Cancel</button><button onClick={() => create.mutate({ ...form, planId: form.planId || (plans as any[])[0]?._id })} disabled={create.isPending} className="btn-dist">Onboard</button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Owner Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div><label className="label">Business Name</label><input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} className="input" /></div>
          <div><label className="label">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></div>
          <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" /></div>
          <div><label className="label">City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input" /></div>
          <div><label className="label">State</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input" /></div>
          <div className="col-span-2"><label className="label">Plan</label>
            <select value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })} className="input">
              {(plans as any[]).map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}/mo</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">Default password: <code className="bg-slate-100 px-1 rounded">owner123</code></div>
      </Modal>
    </div>
  );
}

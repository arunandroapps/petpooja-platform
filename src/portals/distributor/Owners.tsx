import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Owner } from '../../types';
import { fmtMoney, fmtDate } from '../../utils/format';
import { useNavigate, useParams } from 'react-router-dom';

export default function DistOwners() {
  const { currentUser, owners, distributors, plans, upsertOwner } = usePlatform();
  const dist = distributors.find(d=>d.id===currentUser?.entityId);
  const myOwners = owners.filter(o=>o.distributorId===dist?.id);
  const nav = useNavigate();
  const [modal, setModal] = useState(false);
  const empty: Owner = { id:'', distributorId:dist?.id||'', planId:'plan-basic', name:'', email:'', phone:'', businessName:'', city:'', state:'', status:'pending', joinedAt:Date.now(), subscriptionStart:Date.now(), subscriptionEnd:Date.now()+30*86400000, totalRestaurants:0, totalRevenue:0 };
  const [form, setForm] = useState(empty);

  const save = () => { upsertOwner({...form, id:form.id||newId()}); setModal(false); setForm(empty); };

  return (
    <div className="p-6">
      <PageHeader title="My Owners" subtitle={`${myOwners.length} owners in ${dist?.region}`}
        actions={<button onClick={()=>setModal(true)} className="btn-dist"><Plus size={16}/>Onboard Owner</button>}/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myOwners.map(o=>{
          const plan=plans.find(p=>p.id===o.planId);
          const daysLeft=Math.ceil((o.subscriptionEnd-Date.now())/86400000);
          return(
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{o.businessName}</div>
                  <div className="text-xs text-slate-500">{o.name} · {o.city}</div>
                </div>
                <span className={`badge ${o.status==='active'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              </div>
              <div className="text-xs text-slate-500 mb-3">{o.email} · {o.phone}</div>
              <div className="flex items-center justify-between text-sm">
                <span className="badge" style={{background:plan?.color+'20',color:plan?.color}}>{plan?.name}</span>
                <span className="font-semibold">{fmtMoney(o.totalRevenue)}</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">Sub expires: {fmtDate(o.subscriptionEnd)} · {daysLeft}d left</div>
              <div className="mt-3 text-xs font-medium text-slate-600">{o.totalRestaurants} restaurant(s)</div>
            </div>
          );
        })}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title="Onboard New Owner" size="lg"
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-dist">Onboard</button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Owner Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input"/></div>
          <div><label className="label">Business Name</label><input value={form.businessName} onChange={e=>setForm({...form,businessName:e.target.value})} className="input"/></div>
          <div><label className="label">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input"/></div>
          <div><label className="label">Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input"/></div>
          <div><label className="label">City</label><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="input"/></div>
          <div><label className="label">State</label><input value={form.state} onChange={e=>setForm({...form,state:e.target.value})} className="input"/></div>
          <div><label className="label">Plan</label>
            <select value={form.planId} onChange={e=>setForm({...form,planId:e.target.value})} className="input">
              {plans.map(p=><option key={p.id} value={p.id}>{p.name} — ₹{p.price}/mo</option>)}
            </select>
          </div>
          <div><label className="label">GST Number</label><input value={form.gst||''} onChange={e=>setForm({...form,gst:e.target.value})} className="input"/></div>
        </div>
        <div className="mt-3 text-xs text-slate-500">Default password will be <code className="bg-slate-100 px-1 rounded">owner123</code>. Owner can change after first login.</div>
      </Modal>
    </div>
  );
}

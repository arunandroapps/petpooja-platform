import { useState } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Plan } from '../../types';
import { fmtMoney } from '../../utils/format';

const empty: Plan = { id:'', name:'', tier:'basic', price:0, yearlyPrice:0, maxRestaurants:1, maxStaff:5, features:[], color:'#6b7280' };

export default function SAPlans() {
  const s = usePlatform();
  const [editing, setEditing] = useState<Plan|null>(null);
  const [featInput, setFeatInput] = useState('');

  const totalMRR = s.owners.filter(o=>o.status==='active').reduce((a,o)=>{const p=s.plans.find(pl=>pl.id===o.planId);return a+(p?.price||0);},0);

  return (
    <div className="p-6">
      <PageHeader title="Plans & Billing" subtitle={`${s.plans.length} plans · MRR ${fmtMoney(totalMRR)}`}
        actions={<button onClick={()=>{setEditing(empty);setFeatInput('');}} className="btn-sa"><Plus size={16}/>Add Plan</button>}/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {s.plans.map(p=>{
          const subscribers=s.owners.filter(o=>o.planId===p.id&&o.status==='active').length;
          return(
            <div key={p.id} className="card p-6 relative group">
              <div className="w-3 h-3 rounded-full mb-4" style={{background:p.color}}/>
              <div className="text-xl font-bold mb-1">{p.name}</div>
              <div className="text-3xl font-bold mb-0.5">{fmtMoney(p.price)}<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <div className="text-xs text-slate-500 mb-4">{fmtMoney(p.yearlyPrice)}/yr · {subscribers} subscribers</div>
              <div className="space-y-2 mb-4">
                {p.features.map((f,i)=><div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-500 shrink-0"/>{f}</div>)}
              </div>
              <div className="text-xs text-slate-500">Max {p.maxRestaurants=== 999?'Unlimited':p.maxRestaurants} restaurants · {p.maxStaff===999?'Unlimited':p.maxStaff} staff</div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1">
                <button onClick={()=>{setEditing(p);setFeatInput(p.features.join('\n'));}} className="p-1 text-slate-500 hover:text-sa-600"><Edit2 size={14}/></button>
                <button onClick={()=>confirm('Delete plan?')&&s.deletePlan(p.id)} className="p-1 text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Subscriber Overview</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="text-left py-2">Plan</th><th className="text-right py-2">Subscribers</th><th className="text-right py-2">Monthly Revenue</th><th className="text-right py-2">Annual Revenue</th></tr>
          </thead>
          <tbody>
            {s.plans.map(p=>{
              const subs=s.owners.filter(o=>o.planId===p.id&&o.status==='active').length;
              return(<tr key={p.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2 text-right">{subs}</td>
                <td className="py-2 text-right font-semibold">{fmtMoney(subs*p.price)}</td>
                <td className="py-2 text-right">{fmtMoney(subs*p.yearlyPrice)}</td>
              </tr>);
            })}
            <tr className="border-t-2 border-slate-300 font-bold">
              <td className="py-2">Total</td>
              <td className="py-2 text-right">{s.owners.filter(o=>o.status==='active').length}</td>
              <td className="py-2 text-right text-sa-700">{fmtMoney(totalMRR)}</td>
              <td className="py-2 text-right">{fmtMoney(totalMRR*12)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Plan':'Add Plan'} size="md"
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button>
          <button onClick={()=>{if(editing)s.upsertPlan({...editing,id:editing.id||newId(),features:featInput.split('\n').filter(Boolean)});setEditing(null);}} className="btn-sa">Save</button></>}>
        {editing&&(
          <div className="space-y-3">
            <div><label className="label">Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Monthly Price ₹</label><input type="number" value={editing.price} onChange={e=>setEditing({...editing,price:parseFloat(e.target.value)||0})} className="input"/></div>
              <div><label className="label">Yearly Price ₹</label><input type="number" value={editing.yearlyPrice} onChange={e=>setEditing({...editing,yearlyPrice:parseFloat(e.target.value)||0})} className="input"/></div>
              <div><label className="label">Max Restaurants</label><input type="number" value={editing.maxRestaurants} onChange={e=>setEditing({...editing,maxRestaurants:parseFloat(e.target.value)||1})} className="input"/></div>
              <div><label className="label">Max Staff</label><input type="number" value={editing.maxStaff} onChange={e=>setEditing({...editing,maxStaff:parseFloat(e.target.value)||5})} className="input"/></div>
              <div><label className="label">Color</label><input type="color" value={editing.color} onChange={e=>setEditing({...editing,color:e.target.value})} className="input h-10"/></div>
              <div><label className="label">Tier</label><select value={editing.tier} onChange={e=>setEditing({...editing,tier:e.target.value as any})} className="input"><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
            </div>
            <div><label className="label">Features (one per line)</label><textarea value={featInput} onChange={e=>setFeatInput(e.target.value)} className="input min-h-[120px]"/></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

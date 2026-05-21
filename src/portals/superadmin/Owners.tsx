import { useState } from 'react';
import { Plus, Edit2, CheckCircle, XCircle, Search } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Owner } from '../../types';
import { fmtMoney, fmtDate } from '../../utils/format';

const empty: Owner = { id:'', distributorId:'', planId:'plan-basic', name:'', email:'', phone:'', businessName:'', city:'', state:'', status:'pending', joinedAt:Date.now(), subscriptionStart:Date.now(), subscriptionEnd:Date.now()+30*86400000, totalRestaurants:0, totalRevenue:0 };

export default function SAOwners() {
  const s = usePlatform();
  const [editing, setEditing] = useState<Owner|null>(null);
  const [search, setSearch] = useState('');
  const filtered = s.owners.filter(o=>o.name.toLowerCase().includes(search.toLowerCase())||o.businessName.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6">
      <PageHeader title="Restaurant Owners" subtitle={`${s.owners.length} total · ${s.owners.filter(o=>o.status==='pending').length} pending approval`}
        actions={<button onClick={()=>setEditing(empty)} className="btn-sa"><Plus size={16}/>Add Owner</button>}/>
      <div className="flex gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="input pl-9" placeholder="Search owners..."/>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Owner / Business</th>
              <th className="text-left px-4 py-3">Distributor</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-center px-4 py-3">Restaurants</th>
              <th className="text-right px-4 py-3">Revenue</th>
              <th className="text-left px-4 py-3">Subscription</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o=>{
              const dist=s.distributors.find(d=>d.id===o.distributorId);
              const plan=s.plans.find(p=>p.id===o.planId);
              const daysLeft=Math.ceil((o.subscriptionEnd-Date.now())/86400000);
              return(
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-slate-500">{o.businessName}</div>
                    <div className="text-xs text-slate-400">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{dist?.name||'—'}</td>
                  <td className="px-4 py-3">
                    <span className="badge" style={{background:plan?.color+'20',color:plan?.color}}>{plan?.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{o.totalRestaurants}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtMoney(o.totalRevenue)}</td>
                  <td className="px-4 py-3 text-xs"><div>{fmtDate(o.subscriptionEnd)}</div><div className={`font-medium ${daysLeft<7?'text-red-500':daysLeft<30?'text-amber-500':'text-emerald-600'}`}>{daysLeft}d left</div></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${o.status==='active'?'bg-emerald-100 text-emerald-700':o.status==='pending'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={()=>setEditing(o)} className="p-1 text-slate-500 hover:text-sa-600"><Edit2 size={14}/></button>
                      {o.status==='pending'&&<button onClick={()=>s.updateOwnerStatus(o.id,'active')} title="Approve" className="p-1 text-emerald-500"><CheckCircle size={14}/></button>}
                      {o.status==='active'&&<button onClick={()=>s.updateOwnerStatus(o.id,'suspended')} title="Suspend" className="p-1 text-red-500"><XCircle size={14}/></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Owner':'Add Owner'} size="lg"
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button><button onClick={()=>{if(editing)s.upsertOwner({...editing,id:editing.id||newId()});setEditing(null);}} className="btn-sa">Save</button></>}>
        {editing&&(
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Owner Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
            <div><label className="label">Business Name</label><input value={editing.businessName} onChange={e=>setEditing({...editing,businessName:e.target.value})} className="input"/></div>
            <div><label className="label">Email</label><input value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} className="input"/></div>
            <div><label className="label">Phone</label><input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} className="input"/></div>
            <div><label className="label">City</label><input value={editing.city} onChange={e=>setEditing({...editing,city:e.target.value})} className="input"/></div>
            <div><label className="label">State</label><input value={editing.state} onChange={e=>setEditing({...editing,state:e.target.value})} className="input"/></div>
            <div><label className="label">Distributor</label><select value={editing.distributorId} onChange={e=>setEditing({...editing,distributorId:e.target.value})} className="input">{s.distributors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="label">Plan</label><select value={editing.planId} onChange={e=>setEditing({...editing,planId:e.target.value})} className="input">{s.plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="label">Status</label><select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as any})} className="input"><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option></select></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

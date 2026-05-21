import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Restaurant } from '../../types';
import { fmtMoney } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

const RST_TYPES = ['Fine Dining','Casual Dining','QSR','Cloud Kitchen','Cafe','Bakery','Bar & Grill'];

export default function OwnRestaurants() {
  const { currentUser, owners, restaurants, upsertRestaurant, plans, setActiveRestaurant } = usePlatform();
  const nav = useNavigate();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  const plan = plans.find(p=>p.id===owner?.planId);
  const myRsts = restaurants.filter(r=>r.ownerId===owner?.id);

  const empty: Restaurant = { id:'', ownerId:owner?.id||'', name:'', type:'Casual Dining', phone:'', address:'', city:owner?.city||'', status:'pending', createdAt:Date.now(), totalTables:0, totalOrders:0, totalRevenue:0 };
  const [editing, setEditing] = useState<Restaurant|null>(null);

  const canAdd = plan ? myRsts.length < plan.maxRestaurants : false;

  return (
    <div className="p-6">
      <PageHeader title="My Restaurants" subtitle={`${myRsts.length}/${plan?.maxRestaurants===999?'∞':plan?.maxRestaurants} branches (${plan?.name} plan)`}
        actions={<button onClick={()=>setEditing(empty)} disabled={!canAdd} className="btn-own disabled:opacity-50"><Plus size={16}/>Add Branch</button>}/>
      {!canAdd&&<div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">You've reached the branch limit for your <b>{plan?.name}</b> plan. Upgrade to add more.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myRsts.map(r=>(
          <div key={r.id} className="card p-4 group relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-slate-500">{r.type} · {r.city}</div>
              </div>
              <span className={`badge ${r.status==='active'?'bg-emerald-100 text-emerald-700':r.status==='pending'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{r.status}</span>
            </div>
            <div className="text-xs text-slate-500 mb-3">{r.address}</div>
            <div className="flex items-center justify-between text-sm mb-3">
              <div><div className="text-xs text-slate-500">Revenue</div><div className="font-semibold">{fmtMoney(r.totalRevenue)}</div></div>
              <div><div className="text-xs text-slate-500">Orders</div><div className="font-semibold">{r.totalOrders.toLocaleString()}</div></div>
              <div><div className="text-xs text-slate-500">Tables</div><div className="font-semibold">{r.totalTables}</div></div>
            </div>
            {r.status==='active'&&(
              <button onClick={()=>{setActiveRestaurant(r.id);nav('/rst');}} className="w-full btn-secondary text-xs">Open Restaurant POS →</button>
            )}
            <button onClick={()=>setEditing(r)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-own-600"><Edit2 size={14}/></button>
          </div>
        ))}
      </div>
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Restaurant':'Add Restaurant'} size="lg"
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button><button onClick={()=>{if(editing)upsertRestaurant({...editing,id:editing.id||newId()});setEditing(null);}} className="btn-own">Save</button></>}>
        {editing&&(
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Restaurant Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
            <div><label className="label">Type</label><select value={editing.type} onChange={e=>setEditing({...editing,type:e.target.value})} className="input">{RST_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Phone</label><input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} className="input"/></div>
            <div><label className="label">Email</label><input value={editing.email||''} onChange={e=>setEditing({...editing,email:e.target.value})} className="input"/></div>
            <div><label className="label">City</label><input value={editing.city} onChange={e=>setEditing({...editing,city:e.target.value})} className="input"/></div>
            <div className="col-span-2"><label className="label">Address</label><input value={editing.address} onChange={e=>setEditing({...editing,address:e.target.value})} className="input"/></div>
            <div><label className="label">GSTIN</label><input value={editing.gstin||''} onChange={e=>setEditing({...editing,gstin:e.target.value})} className="input"/></div>
            <div><label className="label">Total Tables</label><input type="number" value={editing.totalTables} onChange={e=>setEditing({...editing,totalTables:parseInt(e.target.value)||0})} className="input"/></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Distributor } from '../../types';
import { fmtMoney, fmtDate } from '../../utils/format';

const empty: Distributor = { id:'', name:'', email:'', phone:'', region:'', state:'', commissionPct:10, status:'pending', joinedAt:Date.now(), totalOwners:0, totalRestaurants:0, totalRevenue:0, commissionEarned:0 };

export default function SADistributors() {
  const s = usePlatform();
  const [editing, setEditing] = useState<Distributor|null>(null);
  return (
    <div className="p-6">
      <PageHeader title="Distributors" subtitle={`${s.distributors.length} total · ${s.distributors.filter(d=>d.status==='active').length} active`}
        actions={<button onClick={()=>setEditing(empty)} className="btn-sa"><Plus size={16}/>Add Distributor</button>}/>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Distributor</th>
              <th className="text-left px-4 py-3">Region</th>
              <th className="text-center px-4 py-3">Owners</th>
              <th className="text-center px-4 py-3">Restaurants</th>
              <th className="text-right px-4 py-3">Revenue</th>
              <th className="text-right px-4 py-3">Commission</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {s.distributors.map(d=>(
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.email} · {d.phone}</div>
                </td>
                <td className="px-4 py-3">{d.region}<div className="text-xs text-slate-500">{d.state}</div></td>
                <td className="px-4 py-3 text-center font-semibold">{d.totalOwners}</td>
                <td className="px-4 py-3 text-center font-semibold">{d.totalRestaurants}</td>
                <td className="px-4 py-3 text-right">{fmtMoney(d.totalRevenue)}</td>
                <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{fmtMoney(d.commissionEarned)}<div className="text-xs text-slate-400">{d.commissionPct}%</div></td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge ${d.status==='active'?'bg-emerald-100 text-emerald-700':d.status==='pending'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{d.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={()=>setEditing(d)} className="p-1 text-slate-500 hover:text-sa-600"><Edit2 size={14}/></button>
                    {d.status==='pending'&&<button onClick={()=>s.updateDistributorStatus(d.id,'active')} className="p-1 text-emerald-500"><CheckCircle size={14}/></button>}
                    {d.status==='active'&&<button onClick={()=>s.updateDistributorStatus(d.id,'suspended')} className="p-1 text-red-500"><XCircle size={14}/></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Distributor':'Add Distributor'}
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button><button onClick={()=>{if(editing)s.upsertDistributor({...editing,id:editing.id||newId()});setEditing(null);}} className="btn-sa">Save</button></>}>
        {editing&&(
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
            <div><label className="label">Email</label><input value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} className="input"/></div>
            <div><label className="label">Phone</label><input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} className="input"/></div>
            <div><label className="label">Region</label><input value={editing.region} onChange={e=>setEditing({...editing,region:e.target.value})} className="input"/></div>
            <div><label className="label">State</label><input value={editing.state} onChange={e=>setEditing({...editing,state:e.target.value})} className="input"/></div>
            <div><label className="label">Commission %</label><input type="number" value={editing.commissionPct} onChange={e=>setEditing({...editing,commissionPct:parseFloat(e.target.value)||0})} className="input"/></div>
            <div><label className="label">Status</label><select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as any})} className="input"><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option></select></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

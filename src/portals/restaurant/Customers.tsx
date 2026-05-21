import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Star } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Customer } from '../../types';
import { fmtMoney, fmtDate } from '../../utils/format';

export default function RstCustomers() {
  const s = usePlatform();
  const rstId = s.activeRestaurantId;
  const custs = s.customers.filter(c=>c.restaurantId===rstId);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer|null>(null);
  const empty: Customer = {id:'',restaurantId:rstId||'',name:'',phone:'',loyaltyPoints:0,visits:0,totalSpent:0};
  const filtered = custs.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));
  return (
    <div className="p-6">
      <PageHeader title="Customers" subtitle={`${custs.length} registered`}
        actions={<button onClick={()=>setEditing(empty)} className="btn-primary"><Plus size={16}/>Add Customer</button>}/>
      <div className="relative max-w-sm mb-4"><Search size={16} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="input pl-9"/></div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Customer</th><th className="text-right px-4 py-3">Visits</th><th className="text-right px-4 py-3">Spent</th><th className="text-right px-4 py-3">Loyalty</th><th className="text-left px-4 py-3">Last Visit</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-medium">{c.name}</div><div className="text-xs text-slate-500">{c.phone}</div></td>
                <td className="px-4 py-3 text-right">{c.visits}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmtMoney(c.totalSpent)}</td>
                <td className="px-4 py-3 text-right"><span className="badge bg-amber-100 text-amber-700"><Star size={10}/>{c.loyaltyPoints}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.lastVisit?fmtDate(c.lastVisit):'—'}</td>
                <td className="px-4 py-3 text-right"><button onClick={()=>setEditing(c)} className="text-slate-500 hover:text-brand-600 mr-2"><Edit2 size={14}/></button><button onClick={()=>confirm('Delete?')&&s.upsertCustomer({...c,id:'__delete__'})} className="text-red-500"><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Customer':'Add Customer'} size="sm"
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button><button onClick={()=>{if(editing)s.upsertCustomer({...editing,id:editing.id||newId()});setEditing(null);}} className="btn-primary">Save</button></>}>
        {editing&&<div className="space-y-3">
          <div><label className="label">Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
          <div><label className="label">Phone</label><input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} className="input"/></div>
          <div><label className="label">Email</label><input value={editing.email||''} onChange={e=>setEditing({...editing,email:e.target.value})} className="input"/></div>
        </div>}
      </Modal>
    </div>
  );
}

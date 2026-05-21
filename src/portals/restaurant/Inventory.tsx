import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { IngredientStock } from '../../types';
import { fmtMoney, ago } from '../../utils/format';

export default function RstInventory() {
  const s = usePlatform();
  const rstId = s.activeRestaurantId;
  const ings = s.ingredients.filter(i=>i.restaurantId===rstId);
  const lowStock = ings.filter(i=>i.stock<=i.minStock);
  const totalValue = ings.reduce((a,b)=>a+b.stock*b.costPerUnit,0);
  const empty: IngredientStock = {id:'',restaurantId:rstId||'',name:'',unit:'kg',stock:0,minStock:0,costPerUnit:0,lastUpdated:Date.now()};
  const [editing, setEditing] = useState<IngredientStock|null>(null);
  return (
    <div className="p-6">
      <PageHeader title="Inventory" subtitle={`${ings.length} ingredients · Value ${fmtMoney(totalValue)}`}
        actions={<button onClick={()=>setEditing(empty)} className="btn-primary"><Plus size={16}/>Add Ingredient</button>}/>
      {lowStock.length>0&&<div className="card p-4 mb-4 border-l-4 border-red-500">
        <div className="flex items-center gap-2 text-red-700 mb-2"><AlertTriangle size={15}/><span className="font-semibold text-sm">{lowStock.length} low stock</span></div>
        <div className="flex flex-wrap gap-2">{lowStock.map(i=><span key={i.id} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{i.name}: {i.stock} {i.unit}</span>)}</div>
      </div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Ingredient</th><th className="text-right px-4 py-3">Stock</th><th className="text-right px-4 py-3">Min</th><th className="text-right px-4 py-3">Cost/Unit</th><th className="text-right px-4 py-3">Value</th><th className="text-center px-4 py-3">Adjust</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {ings.map(i=>{
              const low=i.stock<=i.minStock;
              return(<tr key={i.id} className={`border-t border-slate-100 hover:bg-slate-50 ${low?'bg-red-50/30':''}`}>
                <td className="px-4 py-3 font-medium">{i.name}</td>
                <td className={`px-4 py-3 text-right font-semibold ${low?'text-red-600':''}`}>{i.stock} {i.unit}</td>
                <td className="px-4 py-3 text-right text-slate-500">{i.minStock}</td>
                <td className="px-4 py-3 text-right">{fmtMoney(i.costPerUnit)}</td>
                <td className="px-4 py-3 text-right">{fmtMoney(i.stock*i.costPerUnit)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={()=>s.adjustStock(i.id,-1)} className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center"><ArrowDown size={11}/></button>
                    <button onClick={()=>s.adjustStock(i.id,1)} className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><ArrowUp size={11}/></button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>setEditing(i)} className="text-slate-500 hover:text-brand-600 mr-2"><Edit2 size={14}/></button>
                  <button onClick={()=>confirm('Delete?')&&s.deleteIngredient(i.id)} className="text-red-500"><Trash2 size={14}/></button>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Ingredient':'Add Ingredient'}
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button><button onClick={()=>{if(editing)s.upsertIngredient({...editing,id:editing.id||newId(),lastUpdated:Date.now()});setEditing(null);}} className="btn-primary">Save</button></>}>
        {editing&&<div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
          <div><label className="label">Unit</label><select value={editing.unit} onChange={e=>setEditing({...editing,unit:e.target.value})} className="input"><option>kg</option><option>g</option><option>L</option><option>ml</option><option>pcs</option></select></div>
          <div><label className="label">Stock</label><input type="number" value={editing.stock} onChange={e=>setEditing({...editing,stock:+e.target.value||0})} className="input"/></div>
          <div><label className="label">Min Stock</label><input type="number" value={editing.minStock} onChange={e=>setEditing({...editing,minStock:+e.target.value||0})} className="input"/></div>
          <div><label className="label">Cost/Unit ₹</label><input type="number" value={editing.costPerUnit} onChange={e=>setEditing({...editing,costPerUnit:+e.target.value||0})} className="input"/></div>
        </div>}
      </Modal>
    </div>
  );
}

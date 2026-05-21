import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney, ago } from '../../utils/format';

export default function RstInventory() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['rst-inventory'], queryFn: rstAPI.getInventory });
  const ings = data?.ingredients || [];
  const [editing, setEditing] = useState<any>(null);

  const create = useMutation({ mutationFn: rstAPI.createIngredient, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-inventory'] }); setEditing(null); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => rstAPI.updateIngredient(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-inventory'] }); setEditing(null); } });
  const adjust = useMutation({ mutationFn: ({ id, delta }: any) => rstAPI.adjustStock(id, delta), onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-inventory'] }) });
  const del = useMutation({ mutationFn: rstAPI.deleteIngredient, onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-inventory'] }) });

  const save = () => { if (!editing) return; editing._id ? update.mutate({ id: editing._id, body: editing }) : create.mutate(editing); };

  return (
    <div className="p-6">
      <PageHeader title="Inventory" subtitle={`${ings.length} ingredients · Value ${fmtMoney(data?.totalValue || 0)}`}
        actions={<button onClick={() => setEditing({ name: '', unit: 'kg', stock: 0, minStock: 0, costPerUnit: 0 })} className="btn-primary"><Plus size={16} />Add Ingredient</button>} />
      {data?.lowStock?.length > 0 && (
        <div className="card p-4 mb-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 text-red-700 mb-2"><AlertTriangle size={15} /><span className="font-semibold text-sm">{data.lowStock.length} low stock</span></div>
          <div className="flex flex-wrap gap-2">{data.lowStock.map((i: any) => <span key={i._id} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{i.name}: {i.stock} {i.unit}</span>)}</div>
        </div>
      )}
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Ingredient</th><th className="text-right px-4 py-3">Stock</th><th className="text-right px-4 py-3">Min</th><th className="text-right px-4 py-3">Value</th><th className="text-center px-4 py-3">Adjust</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {ings.map((i: any) => {
              const low = i.stock <= i.minStock;
              return (
                <tr key={i._id} className={`border-t border-slate-100 hover:bg-slate-50 ${low ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${low ? 'text-red-600' : ''}`}>{i.stock} {i.unit}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{i.minStock}</td>
                  <td className="px-4 py-3 text-right">{fmtMoney(i.stock * i.costPerUnit)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => adjust.mutate({ id: i._id, delta: -1 })} className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center"><ArrowDown size={11} /></button>
                      <button onClick={() => adjust.mutate({ id: i._id, delta: 1 })} className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><ArrowUp size={11} /></button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(i)} className="text-slate-500 hover:text-brand-600 mr-2"><Edit2 size={14} /></button>
                    <button onClick={() => confirm('Delete?') && del.mutate(i._id)} className="text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Ingredient' : 'Add Ingredient'}
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-primary">Save</button></>}>
        {editing && <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div><label className="label">Unit</label><select value={editing.unit} onChange={e => setEditing({ ...editing, unit: e.target.value })} className="input"><option>kg</option><option>g</option><option>L</option><option>ml</option><option>pcs</option></select></div>
          <div><label className="label">Stock</label><input type="number" value={editing.stock} onChange={e => setEditing({ ...editing, stock: +e.target.value })} className="input" /></div>
          <div><label className="label">Min Stock</label><input type="number" value={editing.minStock} onChange={e => setEditing({ ...editing, minStock: +e.target.value })} className="input" /></div>
          <div><label className="label">Cost/Unit ₹</label><input type="number" value={editing.costPerUnit} onChange={e => setEditing({ ...editing, costPerUnit: +e.target.value })} className="input" /></div>
        </div>}
      </Modal>
    </div>
  );
}

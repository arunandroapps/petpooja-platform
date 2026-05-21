import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney } from '../../utils/format';

export default function RstMenu() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey: ['rst-categories'], queryFn: rstAPI.getCategories });
  const { data: items = [] } = useQuery({ queryKey: ['rst-menu'], queryFn: rstAPI.getMenuItems });
  const [tab, setTab] = useState<'items' | 'cats'>('items');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [editItem, setEditItem] = useState<any>(null);
  const [editCat, setEditCat] = useState<any>(null);

  const createItem = useMutation({ mutationFn: rstAPI.createMenuItem, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-menu'] }); setEditItem(null); } });
  const updateItem = useMutation({ mutationFn: ({ id, body }: any) => rstAPI.updateMenuItem(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-menu'] }); setEditItem(null); } });
  const deleteItem = useMutation({ mutationFn: rstAPI.deleteMenuItem, onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-menu'] }) });
  const toggleItem = useMutation({ mutationFn: rstAPI.toggleMenuItem, onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-menu'] }) });
  const createCat = useMutation({ mutationFn: rstAPI.createCategory, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-categories'] }); setEditCat(null); } });
  const updateCat = useMutation({ mutationFn: ({ id, body }: any) => rstAPI.updateCategory(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-categories'] }); setEditCat(null); } });
  const deleteCat = useMutation({ mutationFn: rstAPI.deleteCategory, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-categories', 'rst-menu'] }); } });

  const saveItem = () => { if (!editItem) return; editItem._id ? updateItem.mutate({ id: editItem._id, body: editItem }) : createItem.mutate(editItem); };
  const saveCat = () => { if (!editCat) return; editCat._id ? updateCat.mutate({ id: editCat._id, body: editCat }) : createCat.mutate(editCat); };

  const filtered = (items as any[]).filter(m => (filterCat === 'all' || m.categoryId?._id === filterCat || m.categoryId === filterCat) && (search === '' || m.name.toLowerCase().includes(search.toLowerCase())));
  const catId = (c: any) => c._id || c;
  const catName = (catRef: any) => (cats as any[]).find(c => c._id === catRef?._id || c._id === catRef)?.name || '—';

  return (
    <div className="p-6">
      <PageHeader title="Menu" subtitle={`${(items as any[]).length} items in ${(cats as any[]).length} categories`}
        actions={tab === 'items'
          ? <button onClick={() => setEditItem({ name: '', categoryId: (cats as any[])[0]?._id, price: 0, tax: 5, veg: true, available: true })} className="btn-primary"><Plus size={16} />Add Item</button>
          : <button onClick={() => setEditCat({ name: '', color: '#f97316' })} className="btn-primary"><Plus size={16} />Add Category</button>} />
      <div className="flex gap-1 bg-white p-1 rounded-lg border inline-flex mb-4">
        {(['items', 'cats'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm font-medium rounded ${tab === t ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{t === 'items' ? 'Menu Items' : 'Categories'}</button>)}
      </div>

      {tab === 'items' && (
        <>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search..." /></div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input max-w-xs"><option value="all">All</option>{(cats as any[]).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Item</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Type</th><th className="text-right px-4 py-3">Price</th><th className="text-center px-4 py-3">Available</th><th className="px-4 py-3"></th></tr></thead>
              <tbody>
                {filtered.map((m: any) => (
                  <tr key={m._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3"><div className="font-medium">{m.name}</div>{m.description && <div className="text-xs text-slate-500">{m.description}</div>}</td>
                    <td className="px-4 py-3 text-slate-500">{catName(m.categoryId)}</td>
                    <td className="px-4 py-3"><span className={`badge ${m.veg ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.veg ? 'Veg' : 'Non-veg'}</span></td>
                    <td className="px-4 py-3 text-right font-semibold">{fmtMoney(m.price)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleItem.mutate(m._id)} className={`relative w-10 h-5 rounded-full ${m.available ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${m.available ? 'left-5' : 'left-0.5'}`} /></button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditItem({ ...m, categoryId: catId(m.categoryId) })} className="text-slate-500 hover:text-brand-600 mr-2"><Edit2 size={14} /></button>
                      <button onClick={() => confirm('Delete?') && deleteItem.mutate(m._id)} className="text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'cats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(cats as any[]).map(c => (
            <div key={c._id} className="card p-4 group relative">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mb-2" style={{ background: c.color || '#f97316' }}>{c.name.charAt(0)}</div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-slate-500">{(items as any[]).filter(m => m.categoryId?._id === c._id || m.categoryId === c._id).length} items</div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                <button onClick={() => setEditCat(c)} className="p-1 text-slate-500 hover:text-brand-600"><Edit2 size={12} /></button>
                <button onClick={() => confirm('Delete?') && deleteCat.mutate(c._id)} className="p-1 text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={editItem?._id ? 'Edit Item' : 'Add Item'} size="lg"
        footer={<><button onClick={() => setEditItem(null)} className="btn-secondary">Cancel</button><button onClick={saveItem} disabled={createItem.isPending || updateItem.isPending} className="btn-primary">Save</button></>}>
        {editItem && <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Name</label><input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} className="input" /></div>
          <div><label className="label">Category</label><select value={editItem.categoryId} onChange={e => setEditItem({ ...editItem, categoryId: e.target.value })} className="input">{(cats as any[]).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
          <div><label className="label">Price ₹</label><input type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: +e.target.value })} className="input" /></div>
          <div><label className="label">Tax %</label><input type="number" value={editItem.tax} onChange={e => setEditItem({ ...editItem, tax: +e.target.value })} className="input" /></div>
          <div><label className="label">Type</label><select value={editItem.veg ? 'veg' : 'non'} onChange={e => setEditItem({ ...editItem, veg: e.target.value === 'veg' })} className="input"><option value="veg">Veg</option><option value="non">Non-veg</option></select></div>
          <div className="col-span-2"><label className="label">Description</label><textarea value={editItem.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="input min-h-[60px]" /></div>
          <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={editItem.available} onChange={e => setEditItem({ ...editItem, available: e.target.checked })} />Available</label>
        </div>}
      </Modal>
      <Modal open={!!editCat} onClose={() => setEditCat(null)} title={editCat?._id ? 'Edit Category' : 'Add Category'} size="sm"
        footer={<><button onClick={() => setEditCat(null)} className="btn-secondary">Cancel</button><button onClick={saveCat} disabled={createCat.isPending || updateCat.isPending} className="btn-primary">Save</button></>}>
        {editCat && <div className="space-y-3">
          <div><label className="label">Name</label><input value={editCat.name} onChange={e => setEditCat({ ...editCat, name: e.target.value })} className="input" /></div>
          <div><label className="label">Color</label><input type="color" value={editCat.color || '#f97316'} onChange={e => setEditCat({ ...editCat, color: e.target.value })} className="input h-10" /></div>
        </div>}
      </Modal>
    </div>
  );
}

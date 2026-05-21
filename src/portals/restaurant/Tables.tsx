import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usePlatform, newId } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import type { Table, TableStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

const statusColor: Record<TableStatus,string>={free:'bg-emerald-100 text-emerald-800 border-emerald-300',occupied:'bg-red-100 text-red-800 border-red-300',reserved:'bg-amber-100 text-amber-800 border-amber-300',cleaning:'bg-slate-100 text-slate-600 border-slate-300'};

export default function RstTables() {
  const s = usePlatform();
  const nav = useNavigate();
  const rstId = s.activeRestaurantId;
  const tables = s.tables.filter(t=>t.restaurantId===rstId);
  const areas = [...new Set(tables.map(t=>t.area))];
  const [editing, setEditing] = useState<Table|null>(null);
  const empty: Table = {id:'',restaurantId:rstId||'',name:'',area:'Indoor',seats:4,status:'free'};

  return (
    <div className="p-6">
      <PageHeader title="Tables" subtitle="Floor plan & live status"
        actions={<button onClick={()=>setEditing(empty)} className="btn-primary"><Plus size={16}/>Add Table</button>}/>
      <div className="flex gap-4 text-xs mb-4">
        {(['free','occupied','reserved','cleaning'] as TableStatus[]).map(st=>(
          <div key={st} className="flex items-center gap-1 capitalize"><span className={`w-3 h-3 rounded ${statusColor[st].split(' ')[0]}`}/>{st} ({tables.filter(t=>t.status===st).length})</div>
        ))}
      </div>
      {areas.map(area=>(
        <div key={area} className="mb-6">
          <div className="text-sm font-semibold text-slate-700 mb-3">{area}</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {tables.filter(t=>t.area===area).map(t=>(
              <div key={t.id} onClick={()=>{if(t.status==='free'){s.setCartType('dine-in');s.setCartTable(t.id);nav('/rst/pos');}else s.setTableStatus(t.id,'free');}}
                className={`relative aspect-square rounded-xl border-2 ${statusColor[t.status]} flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition group`}>
                <div className="font-bold">{t.name}</div>
                <div className="text-[10px]">{t.seats}p</div>
                <div className="text-[10px] uppercase font-medium">{t.status}</div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5">
                  <button onClick={e=>{e.stopPropagation();setEditing(t);}} className="p-0.5 bg-white rounded shadow"><Edit2 size={9}/></button>
                  <button onClick={e=>{e.stopPropagation();if(confirm('Delete?'))s.deleteTable(t.id);}} className="p-0.5 bg-white rounded shadow text-red-500"><Trash2 size={9}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Edit Table':'Add Table'} size="sm"
        footer={<><button onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button><button onClick={()=>{if(editing)s.upsertTable({...editing,id:editing.id||newId()});setEditing(null);}} className="btn-primary">Save</button></>}>
        {editing&&(
          <div className="space-y-3">
            <div><label className="label">Name</label><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="input"/></div>
            <div><label className="label">Area</label><input value={editing.area} onChange={e=>setEditing({...editing,area:e.target.value})} className="input"/></div>
            <div><label className="label">Seats</label><input type="number" value={editing.seats} onChange={e=>setEditing({...editing,seats:parseInt(e.target.value)||0})} className="input"/></div>
            <div><label className="label">Status</label><select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as TableStatus})} className="input"><option value="free">Free</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option><option value="cleaning">Cleaning</option></select></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

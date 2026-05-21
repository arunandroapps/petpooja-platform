import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import { useAppStore } from '../../store/useAppStore';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { useNavigate } from 'react-router-dom';

const statusColor: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  occupied: 'bg-red-100 text-red-800 border-red-300',
  reserved: 'bg-amber-100 text-amber-800 border-amber-300',
  cleaning: 'bg-slate-100 text-slate-600 border-slate-300',
};

export default function RstTables() {
  const qc = useQueryClient();
  const store = useAppStore();
  const nav = useNavigate();
  const { data: tables = [] } = useQuery({ queryKey: ['rst-tables'], queryFn: rstAPI.getTables, refetchInterval: 15000 });
  const [editing, setEditing] = useState<any>(null);
  const areas = [...new Set((tables as any[]).map(t => t.area))];

  const updateStatus = useMutation({ mutationFn: ({ id, status }: any) => rstAPI.updateTableStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-tables'] }) });
  const createTable = useMutation({ mutationFn: rstAPI.createTable, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-tables'] }); setEditing(null); } });
  const updateTable = useMutation({ mutationFn: ({ id, body }: any) => rstAPI.updateTable(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-tables'] }); setEditing(null); } });
  const deleteTable = useMutation({ mutationFn: rstAPI.deleteTable, onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-tables'] }) });

  const save = () => {
    if (!editing) return;
    if (editing._id) updateTable.mutate({ id: editing._id, body: editing });
    else createTable.mutate(editing);
  };

  return (
    <div className="p-6">
      <PageHeader title="Tables" subtitle="Floor plan & live status"
        actions={<button onClick={() => setEditing({ name: '', area: 'Indoor', seats: 4, status: 'free' })} className="btn-primary"><Plus size={16} />Add Table</button>} />
      <div className="flex gap-4 text-xs mb-4">
        {['free', 'occupied', 'reserved', 'cleaning'].map(st => (
          <div key={st} className="flex items-center gap-1 capitalize"><span className={`w-3 h-3 rounded ${statusColor[st].split(' ')[0]}`} />{st} ({(tables as any[]).filter(t => t.status === st).length})</div>
        ))}
      </div>
      {areas.map(area => (
        <div key={area} className="mb-6">
          <div className="text-sm font-semibold text-slate-700 mb-3">{area}</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {(tables as any[]).filter(t => t.area === area).map(t => (
              <div key={t._id}
                onClick={() => { if (t.status !== 'cleaning') { store.selectTable(t._id, t.name); nav('/rst/pos'); } }}
                className={`relative aspect-square rounded-xl border-2 ${statusColor[t.status]} flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition group`}>
                <div className="font-bold">{t.name}</div>
                <div className="text-[10px]">{t.seats}p</div>
                <div className="text-[10px] uppercase">{t.status}</div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5">
                  <button onClick={e => { e.stopPropagation(); setEditing(t); }} className="p-0.5 bg-white rounded shadow"><Edit2 size={9} /></button>
                  <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) deleteTable.mutate(t._id); }} className="p-0.5 bg-white rounded shadow text-red-500"><Trash2 size={9} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Table' : 'Add Table'} size="sm"
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-primary">Save</button></>}>
        {editing && <div className="space-y-3">
          <div><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div><label className="label">Area</label><input value={editing.area} onChange={e => setEditing({ ...editing, area: e.target.value })} className="input" /></div>
          <div><label className="label">Seats</label><input type="number" value={editing.seats} onChange={e => setEditing({ ...editing, seats: +e.target.value })} className="input" /></div>
        </div>}
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';

const roleColors: Record<string, string> = { manager: 'bg-purple-100 text-purple-700', cashier: 'bg-emerald-100 text-emerald-700', waiter: 'bg-amber-100 text-amber-700', chef: 'bg-red-100 text-red-700', delivery: 'bg-cyan-100 text-cyan-700' };

export default function RstStaff() {
  const qc = useQueryClient();
  const { data: staff = [] } = useQuery({ queryKey: ['rst-staff'], queryFn: rstAPI.getStaff });
  const [editing, setEditing] = useState<any>(null);

  const create = useMutation({ mutationFn: rstAPI.createStaff, onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-staff'] }); setEditing(null); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => rstAPI.updateStaff(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['rst-staff'] }); setEditing(null); } });
  const del = useMutation({ mutationFn: rstAPI.deleteStaff, onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-staff'] }) });

  const save = () => { if (!editing) return; editing._id ? update.mutate({ id: editing._id, body: editing }) : create.mutate(editing); };

  return (
    <div className="p-6">
      <PageHeader title="Staff" subtitle={`${(staff as any[]).length} members`}
        actions={<button onClick={() => setEditing({ name: '', role: 'waiter', phone: '', pin: '0000', active: true })} className="btn-primary"><Plus size={16} />Add Staff</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(staff as any[]).map(m => (
          <div key={m._id} className="card p-4 flex gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold">{m.name.charAt(0)}</div>
            <div className="flex-1">
              <div className="font-semibold">{m.name}{!m.active && <span className="ml-2 text-[10px] text-red-500">Inactive</span>}</div>
              <span className={`badge ${roleColors[m.role] || 'bg-slate-100 text-slate-600'} capitalize text-[11px] mt-0.5`}>{m.role}</span>
              <div className="text-xs text-slate-500 mt-0.5">{m.phone}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1">
              <button onClick={() => setEditing({ ...m, pin: '' })} className="p-1 text-slate-500 hover:text-brand-600"><Edit2 size={13} /></button>
              <button onClick={() => confirm('Delete?') && del.mutate(m._id)} className="p-1 text-red-500"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit Staff' : 'Add Staff'}
        footer={<><button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button onClick={save} disabled={create.isPending || update.isPending} className="btn-primary">Save</button></>}>
        {editing && <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
          <div><label className="label">Role</label><select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} className="input"><option value="manager">Manager</option><option value="cashier">Cashier</option><option value="waiter">Waiter</option><option value="chef">Chef</option><option value="delivery">Delivery</option></select></div>
          <div><label className="label">New PIN (4 digits)</label><input value={editing.pin} maxLength={4} placeholder={editing._id ? 'Leave blank to keep' : '0000'} onChange={e => setEditing({ ...editing, pin: e.target.value })} className="input" /></div>
          <div><label className="label">Phone</label><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="input" /></div>
          <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} />Active</label>
        </div>}
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';

export default function SASettings() {
  const { platformSettings, updatePlatformSettings, resetAll, users } = usePlatform();
  const [draft, setDraft] = useState(platformSettings);
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Platform Settings" actions={
        <>
          <button onClick={()=>{if(confirm('Reset ALL platform data?'))resetAll();}} className="btn-secondary"><RefreshCw size={16}/>Reset Demo</button>
          <button onClick={()=>updatePlatformSettings(draft)} className="btn-sa"><Save size={16}/>Save</button>
        </>
      }/>
      <div className="space-y-4">
        <div className="card p-5 space-y-3">
          <div className="font-semibold text-slate-800 mb-2">Platform Info</div>
          <div><label className="label">Platform Name</label><input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} className="input"/></div>
          <div><label className="label">Support Email</label><input value={draft.supportEmail} onChange={e=>setDraft({...draft,supportEmail:e.target.value})} className="input"/></div>
          <div><label className="label">Default Tax %</label><input type="number" value={draft.defaultTax} onChange={e=>setDraft({...draft,defaultTax:parseFloat(e.target.value)||0})} className="input"/></div>
          <div><label className="label">Free Trial Days</label><input type="number" value={draft.trialDays} onChange={e=>setDraft({...draft,trialDays:parseInt(e.target.value)||0})} className="input"/></div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-slate-800 mb-3">Demo Credentials</div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-1">Role</th><th className="text-left py-1">Email</th><th className="text-left py-1">Password</th></tr></thead>
            <tbody>
              {users.slice(0,7).map(u=>(
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-1.5 capitalize font-medium">{u.role}</td>
                  <td className="py-1.5 text-slate-600">{u.email}</td>
                  <td className="py-1.5 text-slate-400 font-mono">{u.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

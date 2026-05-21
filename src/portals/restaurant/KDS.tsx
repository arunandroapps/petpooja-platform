import { usePlatform } from '../../store/usePlatform';
import { ago } from '../../utils/format';

export default function RstKDS() {
  const s = usePlatform();
  const rstId = s.activeRestaurantId;
  const active = s.orders.filter(o=>o.restaurantId===rstId&&(o.status==='preparing'||o.status==='pending'));
  const cols: Record<string, typeof active>={new:[],preparing:[],ready:[],served:[]};
  active.forEach(o=>{
    const earliest=o.items.reduce((m,it)=>{const v=it.status||'new';if(v==='new')return'new';if(v==='preparing'&&m!=='new')return'preparing';if(v==='ready'&&m==='served')return'ready';return m;},'served');
    cols[earliest]?.push(o);
  });
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Kitchen Display System</h1>
        <p className="text-sm text-slate-500">{active.length} active tickets</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-hidden">
        {(['new','preparing','ready','served'] as const).map(col=>(
          <div key={col} className="flex flex-col bg-slate-100 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-white border-b border-slate-200 font-semibold text-sm capitalize flex items-center justify-between">{col}<span className="text-xs text-slate-400">{cols[col]?.length}</span></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {(cols[col]||[]).map(o=>{
                const age=Math.floor((Date.now()-o.createdAt)/60000);
                return(
                  <div key={o.id} className={`bg-white p-3 rounded-lg shadow-sm border-l-4 ${age>15?'border-red-500':age>8?'border-amber-500':'border-emerald-500'}`}>
                    <div className="flex justify-between mb-1">
                      <div className="font-bold">#{o.number}</div>
                      <div className="text-[11px] text-slate-500">{ago(o.createdAt)}</div>
                    </div>
                    <div className="text-[11px] uppercase text-slate-500 mb-2">{o.type}{o.tableId&&` · ${s.tables.find(t=>t.id===o.tableId)?.name}`}</div>
                    {o.items.map(it=>(
                      <div key={it.id} className="text-sm py-0.5 flex justify-between">
                        <span><b>{it.qty}×</b> {it.name}{it.notes&&<span className="text-amber-600 italic text-[11px]"> ({it.notes})</span>}</span>
                        <select value={it.status||'new'} onChange={e=>s.updateOrderItemStatus(o.id,it.id,e.target.value as any)} className="text-[10px] bg-slate-100 border-0 rounded px-1">
                          <option value="new">New</option><option value="preparing">Cooking</option><option value="ready">Ready</option><option value="served">Served</option>
                        </select>
                      </div>
                    ))}
                  </div>
                );
              })}
              {(cols[col]||[]).length===0&&<div className="text-center text-slate-400 text-xs py-6">Empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

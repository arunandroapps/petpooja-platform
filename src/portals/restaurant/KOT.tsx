import { Printer, CheckCircle2, X } from 'lucide-react';
import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtTime, ago, fmtMoney } from '../../utils/format';

export default function RstKOT() {
  const s = usePlatform();
  const rstId = s.activeRestaurantId;
  const active = s.orders.filter(o=>o.restaurantId===rstId&&(o.status==='preparing'||o.status==='pending'||o.status==='ready'));
  return (
    <div className="p-6">
      <PageHeader title="Kitchen Order Tickets" subtitle={`${active.length} active`}/>
      {active.length===0&&<div className="card p-12 text-center text-slate-400">No active KOTs. Orders will appear here.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.map(o=>(
          <div key={o.id} className="card p-4">
            <div className="flex justify-between mb-3">
              <div>
                <div className="text-xs text-slate-500 capitalize">{o.type} · KOT</div>
                <div className="text-2xl font-bold">#{o.number}</div>
                {o.tableId&&<div className="text-xs text-slate-500">Table: {s.tables.find(t=>t.id===o.tableId)?.name}</div>}
              </div>
              <div className="text-right text-xs text-slate-500">{fmtTime(o.createdAt)}<div className="text-amber-600 font-medium">{ago(o.createdAt)}</div></div>
            </div>
            <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
              {o.items.map(it=>(
                <div key={it.id} className="text-sm py-1 border-b border-slate-100 flex justify-between">
                  <div><span className="font-bold text-brand-600">{it.qty}×</span> {it.name}{it.notes&&<div className="text-xs text-slate-500 italic">{it.notes}</div>}</div>
                  <div className="flex gap-1 items-center">
                    {(['new','preparing','ready','served'] as const).map(st=>(
                      <button key={st} onClick={()=>s.updateOrderItemStatus(o.id,it.id,st)} title={st}
                        className={`w-2 h-2 rounded-full ${it.status===st?st==='served'?'bg-emerald-500':st==='ready'?'bg-blue-500':st==='preparing'?'bg-amber-500':'bg-slate-400':'bg-slate-200'}`}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={()=>s.updateOrderStatus(o.id,'completed')} className="btn-primary flex-1 text-xs"><CheckCircle2 size={13}/>Done</button>
              <button onClick={()=>confirm('Cancel?')&&s.cancelOrder(o.id)} className="btn-ghost text-red-500 text-xs"><X size={13}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

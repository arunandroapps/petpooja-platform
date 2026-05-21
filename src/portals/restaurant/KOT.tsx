import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import { fmtTime, ago, fmtMoney } from '../../utils/format';
import { CheckCircle2, X } from 'lucide-react';

export default function RstKOT() {
  const qc = useQueryClient();
  const { data: active = [], isLoading } = useQuery({ queryKey: ['rst-active-orders'], queryFn: rstAPI.getActiveOrders, refetchInterval: 10000 });
  const updateStatus = useMutation({ mutationFn: ({ id, status }: any) => rstAPI.updateOrderStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-active-orders'] }) });
  const updateItemStatus = useMutation({ mutationFn: ({ orderId, itemId, status }: any) => rstAPI.updateItemStatus(orderId, itemId, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-active-orders'] }) });

  return (
    <div className="p-6">
      <PageHeader title="Kitchen Order Tickets" subtitle={`${(active as any[]).length} active`} />
      {isLoading && <div className="text-slate-400 text-center py-8">Loading KOTs...</div>}
      {!isLoading && (active as any[]).length === 0 && <div className="card p-12 text-center text-slate-400">No active KOTs</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(active as any[]).map(o => (
          <div key={o._id} className="card p-4">
            <div className="flex justify-between mb-3">
              <div>
                <div className="text-xs text-slate-500 capitalize">{o.type}</div>
                <div className="text-2xl font-bold">#{o.number}</div>
                {o.tableId && <div className="text-xs text-slate-500">Table: {o.tableId.name}</div>}
              </div>
              <div className="text-right text-xs text-slate-500">{fmtTime(new Date(o.createdAt).getTime())}<div className="text-amber-600 font-medium">{ago(new Date(o.createdAt).getTime())}</div></div>
            </div>
            <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
              {o.items.map((it: any) => (
                <div key={it._id} className="text-sm py-1 border-b border-slate-100 flex justify-between">
                  <div><span className="font-bold text-brand-600">{it.qty}×</span> {it.name}{it.notes && <div className="text-xs text-slate-500 italic">{it.notes}</div>}</div>
                  <div className="flex gap-1 items-center">
                    {(['new', 'preparing', 'ready', 'served'] as const).map(st => (
                      <button key={st} onClick={() => updateItemStatus.mutate({ orderId: o._id, itemId: it._id, status: st })} title={st}
                        className={`w-2 h-2 rounded-full ${it.status === st ? st === 'served' ? 'bg-emerald-500' : st === 'ready' ? 'bg-blue-500' : st === 'preparing' ? 'bg-amber-500' : 'bg-slate-400' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus.mutate({ id: o._id, status: 'completed' })} disabled={updateStatus.isPending} className="btn-primary flex-1 text-xs"><CheckCircle2 size={13} />Done</button>
              <button onClick={() => confirm('Cancel?') && updateStatus.mutate({ id: o._id, status: 'cancelled' })} className="btn-ghost text-red-500 text-xs"><X size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtMoney, fmtDate } from '../../utils/format';

export default function RstOrders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState<any>(null);

  const { data, isLoading } = useQuery({ queryKey: ['rst-orders', status], queryFn: () => rstAPI.getOrders(status !== 'all' ? { status } : {}), refetchInterval: 15000 });
  const orders = data?.orders || [];
  const cancel = useMutation({ mutationFn: (id: string) => rstAPI.updateOrderStatus(id, 'cancelled'), onSuccess: () => qc.invalidateQueries({ queryKey: ['rst-orders'] }) });

  const filtered = orders.filter((o: any) => search === '' || `${o.number}`.includes(search));

  return (
    <div className="p-6">
      <PageHeader title="Orders" subtitle={`${data?.total || 0} total`} />
      <div className="flex gap-3 mb-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order #" className="input pl-9 w-32" /></div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input w-36">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="preparing">Preparing</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Order</th><th className="text-left px-4 py-3">Type</th><th className="text-right px-4 py-3">Items</th><th className="text-right px-4 py-3">Total</th><th className="text-left px-4 py-3">Payment</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Date</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {filtered.map((o: any) => (
              <tr key={o._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">#{o.number}</td>
                <td className="px-4 py-3 capitalize">{o.type}</td>
                <td className="px-4 py-3 text-right">{o.items.reduce((a: number, b: any) => a + b.qty, 0)}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmtMoney(o.total)}</td>
                <td className="px-4 py-3"><span className={`badge ${o.payment === 'unpaid' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'} capitalize`}>{o.payment}</span></td>
                <td className="px-4 py-3"><span className={`badge ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(new Date(o.createdAt).getTime())}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setView(o)} className="text-slate-500 hover:text-brand-600 mr-2"><Eye size={14} /></button>
                  {o.status !== 'cancelled' && o.status !== 'completed' && <button onClick={() => confirm('Cancel?') && cancel.mutate(o._id)} className="text-red-500"><X size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!view} onClose={() => setView(null)} title={`Order #${view?.number}`}>
        {view && <div className="space-y-3">
          <div className="grid grid-cols-2 text-sm gap-2">
            <div><span className="text-slate-500">Type:</span> <span className="capitalize">{view.type}</span></div>
            <div><span className="text-slate-500">Payment:</span> <span className="capitalize">{view.payment}</span></div>
          </div>
          <div className="border-t pt-3">
            {view.items.map((it: any) => <div key={it._id} className="flex justify-between py-1.5 text-sm border-b border-slate-100"><span>{it.qty}× {it.name}</span><span>{fmtMoney(it.qty * it.price)}</span></div>)}
          </div>
          <div className="text-sm space-y-1 pt-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmtMoney(view.subtotal)}</span></div>
            {view.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{fmtMoney(view.discount)}</span></div>}
            <div className="flex justify-between"><span>Tax</span><span>{fmtMoney(view.taxAmount)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{fmtMoney(view.total)}</span></div>
          </div>
        </div>}
      </Modal>
    </div>
  );
}

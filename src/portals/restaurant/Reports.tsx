import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const colors = ['#f97316', '#10b981', '#3b82f6', '#a855f7'];

export default function RstReports() {
  const [days, setDays] = useState(7);
  const { data, isLoading } = useQuery({ queryKey: ['rst-summary', days], queryFn: () => rstAPI.getSummary(days) });

  const daily = (data?.daily || []).map((d: any) => ({ day: d._id, revenue: d.revenue, orders: d.orders }));
  const payData = (data?.byPayment || []).map((p: any) => ({ name: p._id?.toUpperCase(), value: p.revenue }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reports & Analytics" subtitle={`Last ${days} days · ${data?.orders || 0} orders`}
        actions={<select value={days} onChange={e => setDays(+e.target.value)} className="input w-36"><option value={7}>Last 7 days</option><option value={14}>Last 14</option><option value={30}>Last 30</option></select>} />
      {isLoading && <div className="text-slate-400 text-center py-8">Loading...</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ l: 'Revenue', v: fmtMoney(data?.revenue || 0) }, { l: 'Orders', v: data?.orders || 0 }, { l: 'Avg Order Value', v: fmtMoney(data?.aov || 0) }, { l: 'Tax Collected', v: fmtMoney(data?.tax || 0) }].map(x => (
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Daily Revenue</div>
          <div className="h-64"><ResponsiveContainer><BarChart data={daily}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="day" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(v: number) => fmtMoney(v)} /><Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Payment Methods</div>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={payData} dataKey="value" nameKey="name" outerRadius={90} label>{payData.map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Legend /><Tooltip formatter={(v: number) => fmtMoney(v)} /></PieChart></ResponsiveContainer></div>
        </div>
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Top Items</div>
        <table className="w-full text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">#</th><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Revenue</th></tr></thead>
          <tbody>{(data?.topItems || []).map((it: any, i: number) => <tr key={i} className="border-t border-slate-100"><td className="py-2 text-slate-400">{i + 1}</td><td className="py-2 font-medium">{it.name}</td><td className="py-2 text-right">{it.qty}</td><td className="py-2 text-right font-semibold">{fmtMoney(it.revenue)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

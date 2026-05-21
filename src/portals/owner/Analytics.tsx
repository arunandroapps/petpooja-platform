import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function OwnAnalytics() {
  const [days, setDays] = useState(7);
  const { data: restaurants = [] } = useQuery({ queryKey: ['owner-restaurants'], queryFn: ownerAPI.getRestaurants });
  const { data: analytics } = useQuery({ queryKey: ['owner-analytics', days], queryFn: () => ownerAPI.getAnalytics(days) });

  const daily = (analytics?.daily || []).map((d: any) => ({ day: d._id, revenue: d.revenue, orders: d.orders }));
  const totalRevenue = (analytics?.byBranch || []).reduce((a: number, b: any) => a + b.revenue, 0);
  const totalOrders = (analytics?.byBranch || []).reduce((a: number, b: any) => a + b.orders, 0);
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Multi-Branch Analytics" subtitle={`All ${(restaurants as any[]).length} branches combined`}
        actions={<select value={days} onChange={e => setDays(+e.target.value)} className="input w-36"><option value={7}>Last 7 days</option><option value={14}>Last 14</option><option value={30}>Last 30</option></select>} />
      <div className="grid grid-cols-3 gap-4">
        {[{ l: 'Revenue', v: fmtMoney(totalRevenue) }, { l: 'Orders', v: totalOrders }, { l: 'Avg Order Value', v: fmtMoney(aov) }].map(x => (
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Combined Revenue Trend</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => fmtMoney(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ₹" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

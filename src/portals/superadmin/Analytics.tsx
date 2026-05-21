import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

export default function SAAnalytics() {
  const [days, setDays] = useState(30);
  const { data: overview } = useQuery({ queryKey: ['sa-overview'], queryFn: saAPI.getOverview });
  const { data: byDist = [] } = useQuery({ queryKey: ['sa-rev-by-dist'], queryFn: saAPI.getRevByDistributor });
  const { data: daily = [] } = useQuery({ queryKey: ['sa-daily', days], queryFn: () => saAPI.getDailyRevenue(days) });

  const barData = (byDist as any[]).map(d => ({ name: d.region?.split(' ')[0], revenue: Math.round(d.subscriptionRevenue / 100), commission: Math.round(d.commission / 100) }));
  const lineData = (daily as any[]).map((d: any) => ({ day: d._id, revenue: d.revenue, orders: d.orders }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Platform Analytics"
        actions={<select value={days} onChange={e => setDays(+e.target.value)} className="input w-36"><option value={7}>Last 7 days</option><option value={30}>Last 30</option><option value={90}>Last 90</option></select>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ l: 'MRR', v: fmtMoney(overview?.mrr || 0) }, { l: 'Total Revenue', v: fmtMoney(overview?.totalRevenue || 0) }, { l: 'Total Orders', v: (overview?.totalOrders || 0).toLocaleString() }, { l: 'Active Restaurants', v: overview?.activeRestaurants || 0 }].map(x => (
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Daily Revenue Trend</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => fmtMoney(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Subscription Revenue by Distributor</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Revenue (₹00)" />
              <Bar dataKey="commission" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Commission (₹00)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

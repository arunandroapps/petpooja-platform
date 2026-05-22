import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import PageHeader from '../../components/PageHeader';
import { fmtMoney, startOfDay, fmtDay } from '../../utils/format';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, Legend,
} from 'recharts';

const BRANCH_COLORS = ['#f97316', '#0ea5e9', '#10b981', '#a855f7', '#ec4899', '#fbbf24', '#14b8a6'];

export default function OwnAnalytics() {
  const [days, setDays] = useState(7);
  const { data: restaurants = [] } = useQuery({ queryKey: ['owner-restaurants'], queryFn: ownerAPI.getRestaurants });
  const { data: analytics } = useQuery({ queryKey: ['owner-analytics', days], queryFn: () => ownerAPI.getAnalytics(days) });

  const daily = (analytics?.daily || []).map((d: any) => ({ day: d._id, revenue: d.revenue, orders: d.orders }));

  // Branch-wise revenue — match by id
  const branchRevenue = (restaurants as any[]).map((r: any, i: number) => {
    const found = (analytics?.byBranch || []).find((b: any) =>
      b._id === r._id || b._id?.toString() === r._id?.toString()
    );
    return {
      name: r.name.split('—').pop()?.trim() || r.name.split('-').pop()?.trim() || r.name,
      fullName: r.name,
      revenue: found?.revenue || 0,
      orders: found?.orders || 0,
      type: r.type,
      city: r.city,
      status: r.status,
      color: BRANCH_COLORS[i % BRANCH_COLORS.length],
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = branchRevenue.reduce((a, b) => a + b.revenue, 0);
  const totalOrders = branchRevenue.reduce((a, b) => a + b.orders, 0);
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Multi-Branch Analytics"
        subtitle={`${(restaurants as any[]).length} branches · Last ${days} days`}
        actions={
          <select value={days} onChange={e => setDays(+e.target.value)} className="input w-36">
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Total Revenue', v: fmtMoney(totalRevenue) },
          { l: 'Total Orders', v: totalOrders },
          { l: 'Avg Order Value', v: fmtMoney(aov) },
          { l: 'Active Branches', v: (restaurants as any[]).filter((r: any) => r.status === 'active').length },
        ].map(x => (
          <div key={x.l} className="card p-5">
            <div className="text-xs text-slate-500 uppercase">{x.l}</div>
            <div className="text-2xl font-bold mt-1">{x.v}</div>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Combined Revenue Trend</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => fmtMoney(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ₹" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch-wise comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Revenue by Branch</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={branchRevenue} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" fontSize={11} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={80} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="Revenue">
                  {branchRevenue.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch leaderboard table */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Branch Leaderboard</div>
          <div className="space-y-3">
            {branchRevenue.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: b.color }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{b.fullName}</div>
                  <div className="text-xs text-slate-500">{b.type} · {b.city} · {b.orders} orders</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">{fmtMoney(b.revenue)}</div>
                  <div className={`text-[10px] font-medium ${b.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>{b.status}</div>
                </div>
              </div>
            ))}
            {branchRevenue.length === 0 && <div className="text-center text-slate-400 py-4 text-sm">No data</div>}
          </div>
          {/* Total row */}
          <div className="flex justify-between pt-3 mt-3 border-t border-slate-200 font-bold text-sm">
            <span>All Branches Total</span>
            <span className="text-own-700">{fmtMoney(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Detailed branch table */}
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Detailed Branch Performance</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left py-2">#</th>
              <th className="text-left py-2">Branch</th>
              <th className="text-left py-2">Type</th>
              <th className="text-right py-2">Orders</th>
              <th className="text-right py-2">Revenue</th>
              <th className="text-right py-2">Avg/Order</th>
              <th className="text-center py-2">Share</th>
            </tr>
          </thead>
          <tbody>
            {branchRevenue.map((b, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-2 text-slate-400">{i + 1}</td>
                <td className="py-2">
                  <div className="font-medium">{b.fullName}</div>
                  <div className="text-xs text-slate-500">{b.city}</div>
                </td>
                <td className="py-2"><span className="badge bg-slate-100 text-slate-600">{b.type}</span></td>
                <td className="py-2 text-right">{b.orders}</td>
                <td className="py-2 text-right font-semibold">{fmtMoney(b.revenue)}</td>
                <td className="py-2 text-right">{b.orders ? fmtMoney(b.revenue / b.orders) : '—'}</td>
                <td className="py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${totalRevenue ? (b.revenue / totalRevenue) * 100 : 0}%`, background: b.color }} />
                    </div>
                    <span className="text-xs text-slate-500">{totalRevenue ? Math.round((b.revenue / totalRevenue) * 100) : 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 font-bold">
              <td colSpan={3} className="py-2">Total</td>
              <td className="py-2 text-right">{totalOrders}</td>
              <td className="py-2 text-right text-own-700">{fmtMoney(totalRevenue)}</td>
              <td className="py-2 text-right">{fmtMoney(aov)}</td>
              <td className="py-2 text-right text-xs text-slate-500">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

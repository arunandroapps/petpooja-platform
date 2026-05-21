import { useQuery } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import StatCard from '../../components/StatCard';
import { IndianRupee, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { fmtMoney, fmtTime } from '../../utils/format';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RstDashboard() {
  const { data: today } = useQuery({ queryKey: ['rst-today'], queryFn: rstAPI.getToday, refetchInterval: 30000 });
  const { data: summary } = useQuery({ queryKey: ['rst-summary-7'], queryFn: () => rstAPI.getSummary(7) });
  const { data: ordersData } = useQuery({ queryKey: ['rst-orders-recent'], queryFn: () => rstAPI.getOrders({ limit: 6 }) });
  const { data: tables = [] } = useQuery({ queryKey: ['rst-tables'], queryFn: rstAPI.getTables });
  const { data: inventory } = useQuery({ queryKey: ['rst-inventory'], queryFn: rstAPI.getInventory });

  const occupied = (tables as any[]).filter(t => t.status === 'occupied').length;
  const lowStock = inventory?.lowStock?.length || 0;
  const recentOrders = ordersData?.orders || [];
  const daily = summary?.daily || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Restaurant Dashboard</h1>
        <p className="text-sm text-slate-500">Today's live overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={fmtMoney(today?.revenue || 0)} Icon={IndianRupee} color="bg-emerald-500" />
        <StatCard label="Orders Today" value={today?.orders || 0} Icon={ShoppingBag} color="bg-brand-600" />
        <StatCard label="Tables Occupied" value={`${occupied}/${(tables as any[]).length}`} Icon={Users} color="bg-blue-500" />
        <StatCard label="Low Stock" value={lowStock} Icon={AlertTriangle} color={lowStock ? 'bg-red-500' : 'bg-slate-400'} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Revenue — Last 7 days</div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={daily.map((d: any) => ({ day: d._id, revenue: d.revenue }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-3">Recent Orders</div>
          {recentOrders.map((o: any) => (
            <div key={o._id} className="flex items-center justify-between py-2 text-sm border-b border-slate-100 last:border-0">
              <div><span className="font-medium">#{o.number}</span> · <span className="capitalize text-slate-500">{o.type}</span></div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{fmtMoney(o.total)}</span>
                <span className={`badge text-[10px] ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { IndianRupee, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { usePlatform } from '../../store/usePlatform';
import StatCard from '../../components/StatCard';
import { fmtMoney, fmtTime, startOfDay } from '../../utils/format';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export default function RstDashboard() {
  const { activeRestaurantId, orders, ingredients, tables, restaurants } = usePlatform();
  const rst = restaurants.find(r=>r.id===activeRestaurantId);
  const today = startOfDay(Date.now());
  const myOrders = orders.filter(o=>o.restaurantId===activeRestaurantId);
  const todayOrders = myOrders.filter(o=>o.createdAt>=today&&o.status!=='cancelled');
  const todayRev = todayOrders.reduce((a,b)=>a+b.total,0);
  const occupied = tables.filter(t=>t.restaurantId===activeRestaurantId&&t.status==='occupied').length;
  const totalTables = tables.filter(t=>t.restaurantId===activeRestaurantId).length;
  const lowStock = ingredients.filter(i=>i.restaurantId===activeRestaurantId&&i.stock<=i.minStock).length;

  const days: {day:string;revenue:number}[] = [];
  for(let i=6;i>=0;i--){
    const d=startOfDay(Date.now()-i*86400000);
    const ds=myOrders.filter(o=>o.createdAt>=d&&o.createdAt<d+86400000&&o.status!=='cancelled');
    days.push({day:new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}),revenue:ds.reduce((a,o)=>a+o.total,0)});
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{rst?.name}</h1>
        <p className="text-sm text-slate-500">Today's overview · {rst?.city}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={fmtMoney(todayRev)} Icon={IndianRupee} color="bg-emerald-500"/>
        <StatCard label="Orders Today" value={todayOrders.length} Icon={ShoppingBag} color="bg-brand-600"/>
        <StatCard label="Tables" value={`${occupied}/${totalTables}`} sub="occupied" Icon={Users} color="bg-blue-500"/>
        <StatCard label="Low Stock" value={lowStock} Icon={AlertTriangle} color={lowStock?'bg-red-500':'bg-slate-400'}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Revenue (Last 7 days)</div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="day" fontSize={12} stroke="#94a3b8"/>
                <YAxis fontSize={12} stroke="#94a3b8"/>
                <Tooltip/>
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Recent Orders</div>
            <Link to="/rst/orders" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {myOrders.slice(0,6).map(o=>(
            <div key={o.id} className="flex items-center justify-between py-2 text-sm border-b border-slate-100 last:border-0">
              <div><span className="font-medium">#{o.number}</span> · <span className="capitalize text-slate-500">{o.type}</span></div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{fmtMoney(o.total)}</span>
                <span className={`badge text-[10px] ${o.status==='completed'?'bg-emerald-100 text-emerald-700':o.status==='cancelled'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

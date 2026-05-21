import { usePlatform } from '../../store/usePlatform';
import StatCard from '../../components/StatCard';
import { Store, IndianRupee, ReceiptText, Users } from 'lucide-react';
import { fmtMoney, fmtDate, startOfDay } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function OwnDashboard() {
  const { currentUser, owners, restaurants, orders, plans, customers } = usePlatform();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  if(!owner) return null;
  const myRsts = restaurants.filter(r=>r.ownerId===owner.id);
  const myRstIds = myRsts.map(r=>r.id);
  const myOrders = orders.filter(o=>myRstIds.includes(o.restaurantId)&&o.status!=='cancelled');
  const totalRevenue = myOrders.reduce((a,o)=>a+o.total,0);
  const plan = plans.find(p=>p.id===owner.planId);
  const daysLeft = Math.ceil((owner.subscriptionEnd-Date.now())/86400000);

  const today = startOfDay(Date.now());
  const todayOrders = myOrders.filter(o=>o.createdAt>=today);
  const todayRevenue = todayOrders.reduce((a,o)=>a+o.total,0);

  const byBranch = myRsts.map(r=>({ name:r.name.split('—').pop()?.trim()||r.name, revenue:Math.round(r.totalRevenue/1000), orders:r.totalOrders }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{owner.businessName}</h1>
          <p className="text-sm text-slate-500">{owner.city}, {owner.state} · {myRsts.length} branches</p>
        </div>
        <div className="text-right">
          <span className="badge" style={{background:plan?.color+'20',color:plan?.color}}>{plan?.name} Plan</span>
          <div className={`text-xs mt-1 ${daysLeft<7?'text-red-500':daysLeft<30?'text-amber-500':'text-slate-500'}`}>Renews in {daysLeft} days ({fmtDate(owner.subscriptionEnd)})</div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={fmtMoney(todayRevenue)} sub={`${todayOrders.length} orders today`} Icon={IndianRupee} color="bg-own-600"/>
        <StatCard label="Active Branches" value={myRsts.filter(r=>r.status==='active').length} sub={`${myRsts.length} total`} Icon={Store} color="bg-brand-600"/>
        <StatCard label="Total Orders" value={myOrders.length.toLocaleString()} Icon={ReceiptText} color="bg-dist-600"/>
        <StatCard label="Total Revenue" value={fmtMoney(totalRevenue)} Icon={IndianRupee} color="bg-sa-600"/>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Revenue by Branch (₹K)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={byBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="name" fontSize={12} stroke="#94a3b8"/>
              <YAxis fontSize={12} stroke="#94a3b8"/>
              <Tooltip/>
              <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹K)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-3">Branch Summary</div>
          {myRsts.map(r=>(
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-slate-500">{r.type} · {r.city}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{fmtMoney(r.totalRevenue)}</div>
                <div className="text-xs text-slate-500">{r.totalOrders} orders</div>
              </div>
              <span className={`ml-3 badge ${r.status==='active'?'bg-emerald-100 text-emerald-700':r.status==='pending'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{r.status}</span>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-3">Recent Orders (All Branches)</div>
          {myOrders.slice(0,8).map(o=>(
            <div key={o.id} className="flex items-center justify-between py-1.5 text-sm border-b border-slate-100 last:border-0">
              <div><span className="font-medium">#{o.number}</span> · <span className="text-slate-500 capitalize">{o.type}</span></div>
              <span className="font-semibold">{fmtMoney(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

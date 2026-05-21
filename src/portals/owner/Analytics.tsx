import { useState } from 'react';
import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney, startOfDay, fmtDay } from '../../utils/format';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function OwnAnalytics() {
  const { currentUser, owners, restaurants, orders } = usePlatform();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  const myRsts = restaurants.filter(r=>r.ownerId===owner?.id);
  const myRstIds = myRsts.map(r=>r.id);
  const [days, setDays] = useState(7);
  const since = startOfDay(Date.now()-(days-1)*86400000);
  const inRange = orders.filter(o=>myRstIds.includes(o.restaurantId)&&o.createdAt>=since&&o.status!=='cancelled');

  const daily: {day:string;revenue:number;orders:number}[] = [];
  for(let i=days-1;i>=0;i--){
    const d=startOfDay(Date.now()-i*86400000);
    const ds=inRange.filter(o=>o.createdAt>=d&&o.createdAt<d+86400000);
    daily.push({day:fmtDay(d),revenue:ds.reduce((a,o)=>a+o.total,0),orders:ds.length});
  }

  const totalRev=inRange.reduce((a,o)=>a+o.total,0);
  const aov=inRange.length?totalRev/inRange.length:0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Multi-Branch Analytics" subtitle={`All ${myRsts.length} branches combined`}
        actions={<select value={days} onChange={e=>setDays(+e.target.value)} className="input w-36"><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option></select>}/>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Revenue',v:fmtMoney(totalRev)},{l:'Orders',v:inRange.length},{l:'AOV',v:fmtMoney(aov)},{l:'Active Branches',v:myRsts.filter(r=>r.status==='active').length}].map(x=>(
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Combined Revenue Trend</div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="day" fontSize={12} stroke="#94a3b8"/>
              <YAxis fontSize={12} stroke="#94a3b8"/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ₹"/>
              <Line type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} name="Orders"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Branch Leaderboard</div>
        {[...myRsts].sort((a,b)=>b.totalRevenue-a.totalRevenue).map((r,i)=>(
          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold">{i+1}</div>
            <div className="flex-1"><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-slate-500">{r.type}</div></div>
            <div className="text-right"><div className="font-semibold">{fmtMoney(r.totalRevenue)}</div><div className="text-xs text-slate-500">{r.totalOrders} orders</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

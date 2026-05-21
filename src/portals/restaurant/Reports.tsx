import { useState, useMemo } from 'react';
import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney, startOfDay, fmtDay } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

export default function RstReports() {
  const { activeRestaurantId, orders, menu, categories } = usePlatform();
  const [days, setDays] = useState(7);
  const since = startOfDay(Date.now()-(days-1)*86400000);
  const inRange = useMemo(()=>orders.filter(o=>o.restaurantId===activeRestaurantId&&o.createdAt>=since&&o.status!=='cancelled'),[orders,since,activeRestaurantId]);
  const totalRevenue=inRange.reduce((a,b)=>a+b.total,0);
  const taxTotal=inRange.reduce((a,b)=>a+b.taxAmount,0);
  const aov=inRange.length?totalRevenue/inRange.length:0;

  const daily: {day:string;revenue:number;orders:number}[] = [];
  for(let i=days-1;i>=0;i--){const d=startOfDay(Date.now()-i*86400000);const ds=inRange.filter(o=>o.createdAt>=d&&o.createdAt<d+86400000);daily.push({day:fmtDay(d),revenue:ds.reduce((a,o)=>a+o.total,0),orders:ds.length});}

  const payData=['cash','card','upi','wallet'].map(p=>({name:p.toUpperCase(),value:inRange.filter(o=>o.payment===p).reduce((a,b)=>a+b.total,0)}));
  const colors=['#f97316','#10b981','#3b82f6','#a855f7'];

  const itemMap=new Map<string,{name:string;qty:number;revenue:number}>();
  inRange.forEach(o=>o.items.forEach(it=>{const cur=itemMap.get(it.menuItemId)||{name:it.name,qty:0,revenue:0};cur.qty+=it.qty;cur.revenue+=it.qty*it.price;itemMap.set(it.menuItemId,cur);}));
  const topItems=[...itemMap.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,8);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reports & Analytics" subtitle={`Last ${days} days · ${inRange.length} orders`}
        actions={<select value={days} onChange={e=>setDays(+e.target.value)} className="input w-36"><option value={7}>Last 7 days</option><option value={14}>Last 14</option><option value={30}>Last 30</option></select>}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{l:'Revenue',v:fmtMoney(totalRevenue)},{l:'Orders',v:inRange.length},{l:'Avg Order Value',v:fmtMoney(aov)},{l:'Tax Collected',v:fmtMoney(taxTotal)}].map(x=>(
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Daily Revenue</div>
          <div className="h-64"><ResponsiveContainer><BarChart data={daily}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="day" fontSize={12}/><YAxis fontSize={12}/><Tooltip/><Bar dataKey="revenue" fill="#f97316" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Payment Methods</div>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={payData} dataKey="value" nameKey="name" outerRadius={90} label>{payData.map((_,i)=><Cell key={i} fill={colors[i]}/>)}</Pie><Legend/><Tooltip formatter={(v:number)=>fmtMoney(v)}/></PieChart></ResponsiveContainer></div>
        </div>
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Top Items</div>
        <table className="w-full text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">#</th><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Revenue</th></tr></thead>
          <tbody>{topItems.map((it,i)=><tr key={i} className="border-t border-slate-100"><td className="py-2 text-slate-400">{i+1}</td><td className="py-2 font-medium">{it.name}</td><td className="py-2 text-right">{it.qty}</td><td className="py-2 text-right font-semibold">{fmtMoney(it.revenue)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

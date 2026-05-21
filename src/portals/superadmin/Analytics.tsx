import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export default function SAAnalytics() {
  const s = usePlatform();
  const totalRevenue = s.restaurants.reduce((a,b)=>a+b.totalRevenue,0);
  const totalOrders = s.restaurants.reduce((a,b)=>a+b.totalOrders,0);
  const mrr = s.owners.filter(o=>o.status==='active').reduce((a,o)=>{const p=s.plans.find(pl=>pl.id===o.planId);return a+(p?.price||0);},0);

  const byDist = s.distributors.map(d=>{
    const ownerIds=s.owners.filter(o=>o.distributorId===d.id).map(o=>o.id);
    const rstIds=s.restaurants.filter(r=>ownerIds.includes(r.ownerId)).map(r=>r.id);
    const rev=s.restaurants.filter(r=>rstIds.includes(r.id)).reduce((a,r)=>a+r.totalRevenue,0);
    return{name:d.region.split(' ')[0],revenue:Math.round(rev/1000),commission:d.commissionEarned};
  });

  const byType=['Fine Dining','Casual Dining','QSR','Cloud Kitchen','Cafe'].map(t=>({
    name:t, value:s.restaurants.filter(r=>r.type===t).length
  })).filter(x=>x.value>0);
  const colors=['#8b5cf6','#0ea5e9','#10b981','#f97316','#ec4899'];

  const byPlan=s.plans.map(p=>({name:p.name,value:s.owners.filter(o=>o.planId===p.id&&o.status==='active').length,color:p.color}));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Platform Analytics" subtitle="Cross-platform aggregated data"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {label:'Total Platform Revenue',value:fmtMoney(totalRevenue)},
          {label:'MRR (Subscriptions)',value:fmtMoney(mrr)},
          {label:'Total Orders Processed',value:totalOrders.toLocaleString()},
          {label:'Avg Revenue / Restaurant',value:fmtMoney(s.restaurants.length?totalRevenue/s.restaurants.length:0)},
        ].map(x=>(
          <div key={x.label} className="card p-5">
            <div className="text-xs text-slate-500 uppercase">{x.label}</div>
            <div className="text-2xl font-bold mt-1">{x.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Revenue by Distributor Region (₹K)</div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8"/>
                <YAxis fontSize={12} stroke="#94a3b8"/>
                <Tooltip/>
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (₹K)" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Restaurant Types</div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" outerRadius={90} label={({name,value})=>`${name}: ${value}`}>
                  {byType.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Subscription Distribution</div>
        <div className="grid grid-cols-3 gap-6">
          {byPlan.map(p=>(
            <div key={p.name} className="text-center">
              <div className="text-4xl font-bold" style={{color:p.color}}>{p.value}</div>
              <div className="text-sm text-slate-600 mt-1">{p.name}</div>
              <div className="text-xs text-slate-400">{s.plans.find(pl=>pl.name===p.name)&&fmtMoney(s.plans.find(pl=>pl.name===p.name)!.price)}/mo each</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">All Restaurants — Revenue Ranking</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">#</th><th className="text-left py-2">Restaurant</th><th className="text-left py-2">Owner</th><th className="text-left py-2">Type</th><th className="text-right py-2">Orders</th><th className="text-right py-2">Revenue</th></tr></thead>
          <tbody>
            {[...s.restaurants].sort((a,b)=>b.totalRevenue-a.totalRevenue).map((r,i)=>{
              const owner=s.owners.find(o=>o.id===r.ownerId);
              return(<tr key={r.id} className="border-t border-slate-100">
                <td className="py-2 text-slate-400">{i+1}</td>
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2 text-slate-500 text-xs">{owner?.businessName}</td>
                <td className="py-2"><span className="badge bg-slate-100 text-slate-600">{r.type}</span></td>
                <td className="py-2 text-right">{r.totalOrders.toLocaleString()}</td>
                <td className="py-2 text-right font-semibold">{fmtMoney(r.totalRevenue)}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

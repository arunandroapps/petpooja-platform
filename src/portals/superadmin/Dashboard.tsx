import { IndianRupee, Network, Building2, Store, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { usePlatform } from '../../store/usePlatform';
import StatCard from '../../components/StatCard';
import { fmtMoney, fmtDate } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';

export default function SADashboard() {
  const s = usePlatform();
  const totalRevenue = s.restaurants.reduce((a,b)=>a+b.totalRevenue,0);
  const mrr = s.owners.filter(o=>o.status==='active').reduce((a,b)=>{const p=s.plans.find(pl=>pl.id===b.planId);return a+(p?.price||0);},0);
  const pendingOwners = s.owners.filter(o=>o.status==='pending').length;
  const pendingRst = s.restaurants.filter(r=>r.status==='pending').length;

  const distData = s.distributors.map(d=>({ name:d.name.split(' ').slice(0,2).join(' '), owners:d.totalOwners, restaurants:d.totalRestaurants, commission:d.commissionEarned/1000 }));

  const planDist = s.plans.map(p=>({ name:p.name, count:s.owners.filter(o=>o.planId===p.id&&o.status==='active').length }));

  const recentTickets = s.tickets.filter(t=>t.status!=='resolved').slice(0,4);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500">Real-time across all distributors, owners & restaurants</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Recurring Revenue" value={fmtMoney(mrr)} delta="Platform MRR" Icon={IndianRupee} color="bg-sa-600"/>
        <StatCard label="Active Distributors" value={s.distributors.filter(d=>d.status==='active').length} sub={`${s.distributors.length} total`} Icon={Network} color="bg-dist-600"/>
        <StatCard label="Active Owners" value={s.owners.filter(o=>o.status==='active').length} sub={`${pendingOwners} pending approval`} Icon={Building2} color="bg-own-600"/>
        <StatCard label="Active Restaurants" value={s.restaurants.filter(r=>r.status==='active').length} sub={`${pendingRst} pending`} Icon={Store} color="bg-brand-600"/>
      </div>

      {(pendingOwners>0||pendingRst>0) && (
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold"><AlertCircle size={16}/> Pending Approvals</div>
          <div className="flex gap-4 text-sm">
            {pendingOwners>0&&<span className="text-amber-600">{pendingOwners} owner(s) waiting approval</span>}
            {pendingRst>0&&<span className="text-amber-600">{pendingRst} restaurant(s) waiting approval</span>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Distributor Performance</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8"/>
                <YAxis fontSize={11} stroke="#94a3b8"/>
                <Tooltip/>
                <Legend/>
                <Bar dataKey="owners" fill="#0ea5e9" name="Owners" radius={[4,4,0,0]}/>
                <Bar dataKey="restaurants" fill="#8b5cf6" name="Restaurants" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Subscriptions by Plan</div>
          <div className="space-y-3 mt-6">
            {planDist.map(p=>(
              <div key={p.name} className="flex items-center gap-3">
                <div className="text-sm w-24 font-medium">{p.name}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div className="h-3 rounded-full bg-sa-500" style={{width:`${Math.max(5,(p.count/Math.max(...planDist.map(x=>x.count),1))*100)}%`}}/>
                </div>
                <div className="text-sm font-semibold w-8 text-right">{p.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs text-slate-500">Total MRR: {fmtMoney(mrr)}/month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Top Restaurants by Revenue</div>
          <div className="space-y-2">
            {[...s.restaurants].sort((a,b)=>b.totalRevenue-a.totalRevenue).slice(0,6).map((r,i)=>(
              <div key={r.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold">{i+1}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.city} · {r.type}</div>
                </div>
                <div className="text-sm font-semibold">{fmtMoney(r.totalRevenue)}</div>
                <span className={`badge ${r.status==='active'?'bg-emerald-100 text-emerald-700':r.status==='pending'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Open Support Tickets</div>
          {recentTickets.length===0&&<div className="text-sm text-slate-400 py-8 text-center">No open tickets 🎉</div>}
          <div className="space-y-2">
            {recentTickets.map(t=>(
              <div key={t.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{t.subject}</div>
                    <div className="text-xs text-slate-500">{t.fromName} · {fmtDate(t.createdAt)}</div>
                  </div>
                  <span className={`badge ${t.status==='open'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney, fmtDate } from '../../utils/format';
import { Check } from 'lucide-react';

export default function OwnBilling() {
  const { currentUser, owners, plans } = usePlatform();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  const currentPlan = plans.find(p=>p.id===owner?.planId);
  const daysLeft = owner ? Math.ceil((owner.subscriptionEnd-Date.now())/86400000) : 0;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader title="Billing & Subscription"/>
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold">{currentPlan?.name} Plan</div>
            <div className="text-sm text-slate-500 mt-1">{fmtMoney(currentPlan?.price||0)}/month · {fmtMoney(currentPlan?.yearlyPrice||0)}/year</div>
            <div className="mt-2 text-sm">Active until <b>{owner?fmtDate(owner.subscriptionEnd):'—'}</b></div>
            <div className={`mt-1 text-sm font-medium ${daysLeft<7?'text-red-500':daysLeft<30?'text-amber-500':'text-emerald-600'}`}>{daysLeft} days remaining</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Max Branches</div>
            <div className="text-2xl font-bold">{currentPlan?.maxRestaurants===999?'∞':currentPlan?.maxRestaurants}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {currentPlan?.features.map((f,i)=><span key={i} className="flex items-center gap-1 text-xs px-2 py-1 bg-own-50 text-own-700 rounded-full"><Check size={10}/>{f}</span>)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {plans.map(p=>{
          const isActive=p.id===owner?.planId;
          return(
            <div key={p.id} className={`card p-5 ${isActive?'border-2 ring-2':'hover:border-own-400 cursor-pointer'}`} style={isActive?{borderColor:p.color,boxShadow:`0 0 0 2px ${p.color}30`}:{}}>
              {isActive&&<div className="text-xs font-semibold text-own-600 mb-2">✓ Current Plan</div>}
              <div className="text-lg font-bold">{p.name}</div>
              <div className="text-2xl font-bold mt-1">{fmtMoney(p.price)}<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <div className="text-xs text-slate-500 mb-3">{p.maxRestaurants===999?'Unlimited':p.maxRestaurants} branches · {p.maxStaff===999?'Unlimited':p.maxStaff} staff</div>
              <div className="space-y-1">
                {p.features.map((f,i)=><div key={i} className="flex items-center gap-1 text-xs text-slate-600"><Check size={10} className="text-emerald-500"/>{f}</div>)}
              </div>
              {!isActive&&<button className="w-full mt-4 btn-own text-sm">Upgrade to {p.name}</button>}
            </div>
          );
        })}
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Billing History (Demo)</div>
        {[0,1,2].map(i=>(
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
            <div><div className="font-medium">{currentPlan?.name} Plan — Monthly</div><div className="text-xs text-slate-500">{fmtDate(Date.now()-i*30*86400000)}</div></div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{fmtMoney(currentPlan?.price||0)}</span>
              <span className="badge bg-emerald-100 text-emerald-700">Paid</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

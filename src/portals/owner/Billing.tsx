import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import PageHeader from '../../components/PageHeader';
import { fmtMoney, fmtDate } from '../../utils/format';
import { Check } from 'lucide-react';

export default function OwnBilling() {
  const { data } = useQuery({ queryKey: ['owner-billing'], queryFn: ownerAPI.getBilling });
  const owner = data?.owner;
  const plans = data?.plans || [];
  const currentPlan = owner?.planId as any;
  const daysLeft = owner ? Math.ceil((new Date(owner.subscriptionEnd).getTime() - Date.now()) / 86400000) : 0;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader title="Billing & Subscription" />
      {currentPlan && (
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">{currentPlan.name} Plan</div>
              <div className="text-sm text-slate-500 mt-1">{fmtMoney(currentPlan.price)}/month</div>
              <div className="mt-2 text-sm">Active until <b>{owner ? fmtDate(new Date(owner.subscriptionEnd).getTime()) : '—'}</b></div>
              <div className={`mt-1 text-sm font-medium ${daysLeft < 7 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-emerald-600'}`}>{daysLeft} days remaining</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(currentPlan.features || []).map((f: string, i: number) => <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 bg-own-50 text-own-700 rounded-full"><Check size={10} />{f}</span>)}
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {plans.map((p: any) => {
          const isActive = p._id === owner?.planId?._id || p._id === owner?.planId;
          return (
            <div key={p._id} className={`card p-5 ${isActive ? 'border-2' : 'hover:border-own-400 cursor-pointer'}`} style={isActive ? { borderColor: p.color, boxShadow: `0 0 0 2px ${p.color}30` } : {}}>
              {isActive && <div className="text-xs font-semibold text-own-600 mb-2">✓ Current Plan</div>}
              <div className="text-lg font-bold">{p.name}</div>
              <div className="text-2xl font-bold mt-1">{fmtMoney(p.price)}<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <div className="text-xs text-slate-500 mb-3">{p.maxRestaurants === 999 ? 'Unlimited' : p.maxRestaurants} branches</div>
              <div className="space-y-1">{(p.features || []).map((f: string, i: number) => <div key={i} className="flex items-center gap-1 text-xs text-slate-600"><Check size={10} className="text-emerald-500" />{f}</div>)}</div>
              {!isActive && <button className="w-full mt-4 btn-own text-sm">Upgrade to {p.name}</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

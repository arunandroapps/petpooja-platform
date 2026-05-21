import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtDate } from '../../utils/format';

export default function RstSettings() {
  const { currentUser, owners, plans, restaurants, activeRestaurantId } = usePlatform();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  const plan = plans.find(p=>p.id===owner?.planId);
  const rst = restaurants.find(r=>r.id===activeRestaurantId);
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Restaurant Settings"/>
      <div className="space-y-4">
        <div className="card p-5">
          <div className="font-semibold mb-3">Restaurant Info</div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            {[['Name',rst?.name],['Type',rst?.type],['City',rst?.city],['Phone',rst?.phone],['Address',rst?.address],['GSTIN',rst?.gstin||'—']].map(([k,v])=>(
              <div key={k}><span className="text-slate-500">{k}:</span> <span className="font-medium">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-3">Subscription</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500">Plan:</span> <b>{plan?.name}</b></div>
            <div><span className="text-slate-500">Expires:</span> {owner?fmtDate(owner.subscriptionEnd):'—'}</div>
            <div><span className="text-slate-500">Max Branches:</span> {plan?.maxRestaurants===999?'Unlimited':plan?.maxRestaurants}</div>
            <div><span className="text-slate-500">Max Staff:</span> {plan?.maxStaff===999?'Unlimited':plan?.maxStaff}</div>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-3">Current User</div>
          <div className="text-sm space-y-1">
            <div><span className="text-slate-500">Name:</span> {currentUser?.name}</div>
            <div><span className="text-slate-500">Email:</span> {currentUser?.email}</div>
            <div><span className="text-slate-500">Role:</span> <span className="capitalize">{currentUser?.role}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

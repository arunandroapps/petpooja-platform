import { useQuery } from '@tanstack/react-query';
import { distAPI } from '../../api/distributor';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';

export default function DistReports() {
  const { data: analytics } = useQuery({ queryKey: ['dist-analytics'], queryFn: distAPI.getAnalytics });
  const { data: commission } = useQuery({ queryKey: ['dist-commission'], queryFn: distAPI.getCommission });

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Territory Reports" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Territory Revenue', v: fmtMoney(analytics?.revenue || 0) },
          { l: 'Total Orders', v: analytics?.orders || 0 },
          { l: 'Active Owners', v: analytics?.ownerCount || 0 },
          { l: 'Active Restaurants', v: analytics?.restaurantCount || 0 },
        ].map(x => (
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Commission Summary</div>
        <div className="text-sm text-slate-600 space-y-2">
          <div className="flex justify-between"><span>Subscription Revenue (Active Owners)</span><span className="font-semibold">{fmtMoney(commission?.subscriptionRevenue || 0)}</span></div>
          <div className="flex justify-between"><span>Commission Rate</span><span className="font-semibold">{commission?.commissionPct}%</span></div>
          <div className="flex justify-between text-emerald-600 font-bold border-t pt-2"><span>Total Commission Earned</span><span>{fmtMoney(commission?.commission || 0)}</span></div>
        </div>
      </div>
    </div>
  );
}

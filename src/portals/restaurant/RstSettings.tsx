import { useAppStore } from '../../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import PageHeader from '../../components/PageHeader';
import { fmtDate } from '../../utils/format';

export default function RstSettings() {
  const { user } = useAppStore();
  const { data } = useQuery({ queryKey: ['owner-billing'], queryFn: ownerAPI.getBilling });
  const owner = data?.owner;
  const plan = owner?.planId;

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Restaurant Settings" />
      <div className="space-y-4">
        <div className="card p-5">
          <div className="font-semibold mb-3">Current Session</div>
          <div className="text-sm space-y-1">
            <div><span className="text-slate-500">Name:</span> {user?.name}</div>
            <div><span className="text-slate-500">Email:</span> {user?.email}</div>
            <div><span className="text-slate-500">Role:</span> <span className="capitalize">{user?.role}</span></div>
          </div>
        </div>
        {owner && <div className="card p-5">
          <div className="font-semibold mb-3">Subscription</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500">Plan:</span> <b>{plan?.name}</b></div>
            <div><span className="text-slate-500">Expires:</span> {fmtDate(new Date(owner.subscriptionEnd).getTime())}</div>
          </div>
        </div>}
        <div className="card p-5 bg-amber-50 border-amber-200">
          <div className="text-sm text-amber-800 font-medium mb-1">Restaurant Settings</div>
          <div className="text-xs text-amber-600">Tax rate, GST, service charge, loyalty % and printer settings are managed by your restaurant owner. Contact your owner to update these.</div>
        </div>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { distAPI } from '../../api/distributor';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DistCommission() {
  const { data: commission } = useQuery({ queryKey: ['dist-commission'], queryFn: distAPI.getCommission });
  const barData = (commission?.owners || []).map((o: any) => ({ name: o.name.split(' ').slice(0, 2).join(' '), commission: o.commission }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Commission Tracker" subtitle={`${commission?.commissionPct}% on subscription revenue`} />
      <div className="grid grid-cols-3 gap-4">
        {[{ l: 'Subscription Revenue', v: fmtMoney(commission?.subscriptionRevenue || 0) }, { l: 'My Commission', v: fmtMoney(commission?.commission || 0) }, { l: 'Active Owners', v: (commission?.owners || []).length }].map(x => (
          <div key={x.l} className="card p-5"><div className="text-xs text-slate-500 uppercase">{x.l}</div><div className="text-2xl font-bold mt-1">{x.v}</div></div>
        ))}
      </div>
      {barData.length > 0 && (
        <div className="card p-5">
          <div className="text-sm font-semibold mb-4">Commission by Owner</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Bar dataKey="commission" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Commission ₹" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="card p-5">
        <div className="text-sm font-semibold mb-3">Breakdown by Owner</div>
        <table className="w-full text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">Owner</th><th className="text-left py-2">Plan</th><th className="text-right py-2">Plan Revenue</th><th className="text-right py-2">Commission</th></tr></thead>
          <tbody>
            {(commission?.owners || []).map((o: any, i: number) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-2 font-medium">{o.name}</td>
                <td className="py-2"><span className="badge bg-slate-100 text-slate-600">{o.plan}</span></td>
                <td className="py-2 text-right">{fmtMoney(o.price)}</td>
                <td className="py-2 text-right font-semibold text-emerald-600">{fmtMoney(o.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

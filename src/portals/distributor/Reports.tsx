import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DistReports() {
  const { currentUser, distributors, owners, restaurants } = usePlatform();
  const dist = distributors.find(d=>d.id===currentUser?.entityId);
  const myOwners = owners.filter(o=>o.distributorId===dist?.id);
  const myRstIds = restaurants.filter(r=>myOwners.some(o=>o.id===r.ownerId)).map(r=>r.id);
  const byOwner = myOwners.map(o=>{
    const rsts = restaurants.filter(r=>r.ownerId===o.id);
    return { name:o.businessName.split(' ').slice(0,2).join(' '), revenue:rsts.reduce((a,r)=>a+r.totalRevenue,0), restaurants:rsts.length };
  });
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Territory Reports"/>
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4">Revenue by Owner</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={byOwner}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="name" fontSize={12}/>
              <YAxis fontSize={12}/>
              <Tooltip formatter={(v:number)=>fmtMoney(v)}/>
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[4,4,0,0]} name="Revenue"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

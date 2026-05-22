import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../../api/owner';
import PageHeader from '../../components/PageHeader';

const roleColors: Record<string, string> = {
  manager: 'bg-purple-100 text-purple-700',
  cashier: 'bg-emerald-100 text-emerald-700',
  waiter: 'bg-amber-100 text-amber-700',
  chef: 'bg-red-100 text-red-700',
  delivery: 'bg-cyan-100 text-cyan-700',
};

export default function OwnStaff() {
  const { data: staff = [], isLoading } = useQuery({ queryKey: ['owner-staff'], queryFn: ownerAPI.getStaff });
  const { data: restaurants = [] } = useQuery({ queryKey: ['owner-restaurants'], queryFn: ownerAPI.getRestaurants });

  // Group staff by branch
  const byBranch = (restaurants as any[]).map(r => ({
    restaurant: r,
    staff: (staff as any[]).filter(s => s.restaurantId?._id === r._id || s.restaurantId === r._id),
  }));
  const totalStaff = (staff as any[]).length;
  const activeStaff = (staff as any[]).filter(s => s.active).length;

  return (
    <div className="p-6">
      <PageHeader
        title="Staff Across All Branches"
        subtitle={`${totalStaff} total · ${activeStaff} active · ${(restaurants as any[]).length} branches`}
      />

      {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {['manager', 'cashier', 'waiter', 'chef', 'delivery'].map(role => {
          const count = (staff as any[]).filter(s => s.role === role).length;
          return (
            <div key={role} className="card p-3 text-center">
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <div className={`text-xs font-medium capitalize mt-1 inline-flex px-2 py-0.5 rounded-full ${roleColors[role] || 'bg-slate-100 text-slate-600'}`}>{role}</div>
            </div>
          );
        })}
      </div>

      {/* Grouped by branch */}
      <div className="space-y-6">
        {byBranch.map(({ restaurant: r, staff: branchStaff }) => (
          <div key={r._id} className="card overflow-hidden">
            {/* Branch header */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.type} · {r.city}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{branchStaff.length} staff</span>
                <span className={`badge ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
              </div>
            </div>

            {branchStaff.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400 text-center">No staff assigned to this branch</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {branchStaff.map((s: any) => (
                  <div key={s._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 truncate">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.phone}</div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${roleColors[s.role] || 'bg-slate-100 text-slate-600'} capitalize text-[10px]`}>{s.role}</span>
                      {!s.active && <div className="text-[10px] text-red-400 mt-0.5">Inactive</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Network, Building2, Store, CreditCard, BarChart3, Headphones, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const nav = [
  { to: '/sa', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { to: '/sa/distributors', label: 'Distributors', Icon: Network },
  { to: '/sa/owners', label: 'Owners', Icon: Building2 },
  { to: '/sa/restaurants', label: 'Restaurants', Icon: Store },
  { to: '/sa/plans', label: 'Plans & Billing', Icon: CreditCard },
  { to: '/sa/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/sa/tickets', label: 'Support', Icon: Headphones },
  { to: '/sa/settings', label: 'Settings', Icon: Settings },
];

export default function SuperadminLayout() {
  const { user, logout } = useAppStore();
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 shrink-0 bg-gradient-to-b from-sa-700 to-sa-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">P</div>
            <div>
              <div className="font-bold leading-tight">Pet Pooja</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">Super Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {nav.map(({ to, label, Icon, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">{user?.name?.charAt(0)}</div>
            <div className="text-sm font-medium truncate">{user?.name}</div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-white/60 hover:text-white"><LogOut size={14} />Sign out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">Platform Management Console</div>
          <div className="text-sm font-medium text-sa-700">🔐 Superadmin</div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50"><Outlet /></main>
      </div>
    </div>
  );
}

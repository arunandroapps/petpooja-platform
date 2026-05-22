import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Network, Building2, Store, CreditCard, BarChart3, Headphones, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useState } from 'react';

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
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 shrink-0 bg-gradient-to-b from-sa-700 to-sa-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">P</div>
            <div>
              <div className="font-bold leading-tight">Pet Pooja</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">Super Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 min-h-0">
          {nav.map(({ to, label, Icon, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        {/* Sign Out — always pinned */}
        <div className="shrink-0 p-3 border-t border-white/10">
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition">
            <LogOut size={15} />Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="text-sm text-slate-500">Platform Management Console</div>
          {/* User dropdown — always visible */}
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-sm">
              <div className="w-6 h-6 rounded-full bg-sa-600 text-white flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)}</div>
              <span className="font-medium text-slate-700 max-w-[120px] truncate">{user?.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showMenu && (
              <>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-800 truncate">{user?.name}</div>
                    <div className="text-[11px] text-slate-500">Superadmin</div>
                  </div>
                  <button onClick={() => { setShowMenu(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                    <LogOut size={14} />Sign Out
                  </button>
                </div>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 min-h-0"><Outlet /></main>
      </div>
    </div>
  );
}

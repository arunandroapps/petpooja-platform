import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Store, IndianRupee, BarChart3, LogOut, Plus, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { distAPI } from '../api/distributor';
import { useState } from 'react';

const nav = [
  { to: '/dist', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { to: '/dist/owners', label: 'My Owners', Icon: Building2 },
  { to: '/dist/restaurants', label: 'Restaurants', Icon: Store },
  { to: '/dist/commission', label: 'Commission', Icon: IndianRupee },
  { to: '/dist/reports', label: 'Reports', Icon: BarChart3 },
];

export default function DistributorLayout() {
  const { user, logout } = useAppStore();
  const nav2 = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { data: dist } = useQuery({ queryKey: ['dist-me'], queryFn: distAPI.me });

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 shrink-0 bg-gradient-to-b from-dist-700 to-dist-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">D</div>
            <div>
              <div className="font-bold leading-tight text-sm truncate">{dist?.name || user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">{dist?.region || 'Distributor'}</div>
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
        {/* Always-visible footer */}
        <div className="shrink-0 p-3 border-t border-white/10 space-y-1.5">
          <button onClick={() => nav2('/dist/owners')}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-medium">
            <Plus size={14} />Onboard Owner
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition">
            <LogOut size={15} />Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="text-sm text-slate-500">{dist?.region} — Distributor Portal</div>
          {/* User dropdown */}
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-sm">
              <div className="w-6 h-6 rounded-full bg-dist-600 text-white flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)}</div>
              <span className="font-medium text-slate-700 max-w-[120px] truncate">{user?.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showMenu && (
              <>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-800 truncate">{user?.name}</div>
                    <div className="text-[11px] text-slate-500">{dist?.region}</div>
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

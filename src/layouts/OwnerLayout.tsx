import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, BarChart3, Users, CreditCard, LogOut, Plus, UtensilsCrossed } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../api/owner';

const nav = [
  { to: '/own', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { to: '/own/restaurants', label: 'My Restaurants', Icon: Store },
  { to: '/own/menu', label: 'Menu Management', Icon: UtensilsCrossed },
  { to: '/own/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/own/staff', label: 'Staff', Icon: Users },
  { to: '/own/billing', label: 'Billing', Icon: CreditCard },
];

export default function OwnerLayout() {
  const { logout } = useAppStore();
  const nav2 = useNavigate();
  const { data } = useQuery({ queryKey: ['owner-me'], queryFn: ownerAPI.me });
  const owner = data;
  const plan = owner?.planId;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 shrink-0 bg-gradient-to-b from-own-700 to-own-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">O</div>
            <div>
              <div className="font-bold leading-tight text-sm truncate">{owner?.businessName || 'Owner'}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">{plan?.name || ''} Plan</div>
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
          <button onClick={() => nav2('/own/restaurants')} className="w-full mb-3 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-medium">
            <Plus size={14} />Add Restaurant
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-white/60 hover:text-white"><LogOut size={14} />Sign out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">{owner?.city} · {owner?.businessName}</div>
          <div className="text-sm font-medium text-own-700">🏢 Owner</div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50"><Outlet /></main>
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Grid3X3, ChefHat, MonitorPlay, UtensilsCrossed, Package, Users, ReceiptText, BarChart3, UserCog, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../api/owner';

const nav = [
  { to: '/rst', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { to: '/rst/pos', label: 'POS / Billing', Icon: ShoppingCart },
  { to: '/rst/tables', label: 'Tables', Icon: Grid3X3 },
  { to: '/rst/kot', label: 'KOT', Icon: ChefHat },
  { to: '/rst/kds', label: 'Kitchen Display', Icon: MonitorPlay },
  { to: '/rst/menu', label: 'Menu', Icon: UtensilsCrossed },
  { to: '/rst/inventory', label: 'Inventory', Icon: Package },
  { to: '/rst/customers', label: 'Customers', Icon: Users },
  { to: '/rst/orders', label: 'Orders', Icon: ReceiptText },
  { to: '/rst/reports', label: 'Reports', Icon: BarChart3 },
  { to: '/rst/staff', label: 'Staff', Icon: UserCog },
  { to: '/rst/settings', label: 'Settings', Icon: Settings },
];

export default function RestaurantLayout() {
  const { user, logout, activeRestaurantId } = useAppStore();
  // Get restaurant info from owner's restaurant list (or a separate endpoint)
  const { data: restaurants } = useQuery({ queryKey: ['owner-restaurants-for-layout'], queryFn: ownerAPI.getRestaurants, enabled: false });
  const rst = restaurants?.find((r: any) => r._id === activeRestaurantId) || { name: 'Restaurant', type: 'Restaurant', city: '', address: '' };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">P</div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">{user?.name?.split(' ')[0]}'s POS</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Pet Pooja Restaurant</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {nav.map(({ to, label, Icon, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition border-l-2 ${isActive ? 'bg-brand-50 text-brand-700 border-brand-600' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)}</div>
            <div className="text-sm font-medium truncate">{user?.name}</div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><LogOut size={14} />Sign out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">🍽️ Restaurant POS</div>
          <div className="text-sm font-medium text-brand-700">Pet Pooja</div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50"><Outlet /></main>
      </div>
    </div>
  );
}

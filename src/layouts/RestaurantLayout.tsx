import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Grid3X3, ChefHat, MonitorPlay, UtensilsCrossed, Package, Users, ReceiptText, BarChart3, UserCog, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { ownerAPI } from '../api/owner';
import { useState } from 'react';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 h-screen z-40 md:static md:z-auto transition-transform duration-300 -translate-x-full md:translate-x-0" style={{transform: sidebarOpen ? 'translateX(0)' : undefined}}>
        {/* Logo */}
        <div className="px-3 md:px-4 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">P</div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 leading-tight text-sm truncate">Pet Pooja</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 truncate">Restaurant POS</div>
            </div>
          </div>
        </div>

        {/* Nav — scrollable if needed */}
        <nav className="flex-1 overflow-y-auto py-2 min-h-0">
          {nav.map(({ to, label, Icon, exact }) => (
            <NavLink key={to} to={to} end={exact} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 md:px-4 py-2 text-sm font-medium transition border-l-2
                ${isActive ? 'bg-brand-50 text-brand-700 border-brand-600' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}>
              <Icon size={16} className="shrink-0" /><span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout — always pinned at bottom */}
        <div className="shrink-0 p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
            <LogOut size={15} className="shrink-0" /><span className="truncate">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with user info always visible */}
        <header className="h-12 bg-white border-b border-slate-200 px-3 md:px-4 flex items-center justify-between shrink-0 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="text-xs text-slate-400 hidden sm:block">🍽️ Restaurant POS</div>

          {/* User dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-sm">
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)}
              </div>
              <span className="font-medium text-slate-700 max-w-[100px] md:max-w-[120px] truncate hidden sm:inline">{user?.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-800 truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                  <LogOut size={14} />Sign Out
                </button>
              </div>
            )}
            {/* Click outside to close */}
            {showUserMenu && (
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 min-h-0"><Outlet /></main>
      </div>
    </div>
  );
}

/**
 * Lightweight Zustand store for LOCAL state only:
 * - Authenticated user session
 * - POS cart
 * - Active restaurant
 *
 * All SERVER data (menu, orders, tables, etc.) is fetched via React Query.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderType } from '../types';
import { authAPI } from '../api/auth';

interface CartLine { id: string; menuItemId: string; qty: number; notes?: string; name: string; price: number }

interface AppState {
  // Session
  user: any | null;
  setUser: (u: any | null) => void;

  // Active restaurant context
  activeRestaurantId: string | null;
  setActiveRestaurant: (id: string | null) => void;

  // Cart (POS)
  cart: CartLine[];
  cartType: OrderType;
  cartTableId?: string;
  cartCustomerId?: string;
  cartDiscount: number;
  addToCart: (item: { menuItemId: string; name: string; price: number }, qty?: number) => void;
  updateCartQty: (menuItemId: string, qty: number) => void;
  removeFromCart: (menuItemId: string) => void;
  setCartNotes: (menuItemId: string, notes: string) => void;
  setCartType: (t: OrderType) => void;
  setCartTable: (id?: string) => void;
  setCartCustomer: (id?: string) => void;
  setCartDiscount: (d: number) => void;
  clearCart: () => void;

  // Auth actions
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      activeRestaurantId: null,
      setActiveRestaurant: (id) => set({ activeRestaurantId: id }),

      cart: [],
      cartType: 'dine-in',
      cartTableId: undefined,
      cartCustomerId: undefined,
      cartDiscount: 0,

      addToCart: (item, qty = 1) => {
        const cart = [...get().cart];
        const idx = cart.findIndex(l => l.menuItemId === item.menuItemId);
        if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + qty };
        else cart.push({ id: Math.random().toString(36).slice(2, 10), ...item, qty });
        set({ cart });
      },
      updateCartQty: (menuItemId, qty) =>
        set({ cart: get().cart.map(l => l.menuItemId === menuItemId ? { ...l, qty: Math.max(1, qty) } : l).filter(l => l.qty > 0) }),
      removeFromCart: (menuItemId) => set({ cart: get().cart.filter(l => l.menuItemId !== menuItemId) }),
      setCartNotes: (menuItemId, notes) => set({ cart: get().cart.map(l => l.menuItemId === menuItemId ? { ...l, notes } : l) }),
      setCartType: (t) => set({ cartType: t }),
      setCartTable: (id) => set({ cartTableId: id }),
      setCartCustomer: (id) => set({ cartCustomerId: id }),
      setCartDiscount: (d) => set({ cartDiscount: Math.max(0, d) }),
      clearCart: () => set({ cart: [], cartTableId: undefined, cartCustomerId: undefined, cartDiscount: 0 }),

      login: async (email, password) => {
        const data = await authAPI.login(email, password);
        set({ user: data.user, activeRestaurantId: data.user.role === 'restaurant' ? data.user.entityId : null });
        return data;
      },
      logout: async () => {
        await authAPI.logout();
        set({ user: null, cart: [], cartTableId: undefined, cartCustomerId: undefined, activeRestaurantId: null });
      },
    }),
    {
      name: 'pp-app-store-v2',
      partialize: (state) => ({ user: state.user, activeRestaurantId: state.activeRestaurantId }),
    }
  )
);

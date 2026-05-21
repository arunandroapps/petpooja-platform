/**
 * Lightweight Zustand store for LOCAL state only:
 * - Authenticated user session
 * - Active restaurant context
 * - POS table session (per-table order management)
 *
 * All SERVER data is fetched via React Query.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderType } from '../types';
import { authAPI } from '../api/auth';

export interface CartLine {
  menuItemId: string;
  qty: number;
  notes?: string;
  name: string;
  price: number;
}

export interface TableSession {
  tableId: string;
  tableName: string;
  orderType: OrderType;
  customerId?: string;
  activeOrderId?: string;       // existing order in kitchen (unpaid)
  existingItems: any[];          // items already in kitchen (from API)
  cart: CartLine[];              // NEW items not yet sent to kitchen
  discount: number;
}

interface AppState {
  // Auth
  user: any | null;
  setUser: (u: any | null) => void;

  // Active restaurant
  activeRestaurantId: string | null;
  setActiveRestaurant: (id: string | null) => void;

  // POS session
  posMode: 'floor' | 'billing';          // floor = table picker, billing = active order
  activePosTableId: string | null;       // which table is currently selected in POS
  tableSessions: Record<string, TableSession>; // one session per tableId
  walkInSession: TableSession | null;    // for takeaway/delivery/online (no table)

  // POS actions
  setPosMode: (m: 'floor' | 'billing') => void;

  selectTable: (tableId: string, tableName: string, existingOrder?: any) => void;
  selectWalkIn: (type: OrderType) => void;
  clearPosSelection: () => void;

  // Cart for active session
  addToCart: (item: { menuItemId: string; name: string; price: number }, qty?: number) => void;
  updateCartQty: (menuItemId: string, qty: number) => void;
  removeFromCart: (menuItemId: string) => void;
  setCartNotes: (menuItemId: string, notes: string) => void;
  setDiscount: (d: number) => void;
  setCustomer: (id?: string) => void;
  clearNewItems: () => void;          // clear cart (keep existing items)
  closeTableSession: (tableId: string) => void;

  // Helpers (read active session)
  getActiveSession: () => TableSession | null;

  // Auth
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const emptySession = (tableId: string, tableName: string, orderType: OrderType = 'dine-in'): TableSession => ({
  tableId, tableName, orderType, cart: [], existingItems: [], discount: 0,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      activeRestaurantId: null,
      setActiveRestaurant: (id) => set({ activeRestaurantId: id }),

      posMode: 'floor',
      activePosTableId: null,
      tableSessions: {},
      walkInSession: null,

      setPosMode: (m) => set({ posMode: m }),

      selectTable: (tableId, tableName, existingOrder) => {
        const sessions = get().tableSessions;
        // Load or create session for this table
        const session: TableSession = sessions[tableId] || emptySession(tableId, tableName);
        // If an existing order is provided (occupied table), load it
        if (existingOrder) {
          session.activeOrderId = existingOrder._id;
          session.existingItems = existingOrder.items || [];
          // Don't reset discount or cart so a waiter can add items without losing input
        }
        set({
          activePosTableId: tableId,
          posMode: 'billing',
          tableSessions: { ...sessions, [tableId]: session },
          walkInSession: null,
        });
      },

      selectWalkIn: (type) => {
        set({
          activePosTableId: null,
          posMode: 'billing',
          walkInSession: { tableId: '__walkin__', tableName: type, orderType: type, cart: [], existingItems: [], discount: 0 },
        });
      },

      clearPosSelection: () => set({ activePosTableId: null, posMode: 'floor', walkInSession: null }),

      getActiveSession: () => {
        const s = get();
        if (s.walkInSession) return s.walkInSession;
        if (s.activePosTableId) return s.tableSessions[s.activePosTableId] || null;
        return null;
      },

      addToCart: (item, qty = 1) => {
        const s = get();
        const updateSession = (sess: TableSession): TableSession => {
          const idx = sess.cart.findIndex(l => l.menuItemId === item.menuItemId);
          const cart = [...sess.cart];
          if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + qty };
          else cart.push({ ...item, qty });
          return { ...sess, cart };
        };

        if (s.walkInSession) {
          set({ walkInSession: updateSession(s.walkInSession) });
        } else if (s.activePosTableId) {
          const sessions = { ...s.tableSessions };
          if (sessions[s.activePosTableId]) {
            sessions[s.activePosTableId] = updateSession(sessions[s.activePosTableId]);
            set({ tableSessions: sessions });
          }
        }
      },

      updateCartQty: (menuItemId, qty) => {
        const update = (sess: TableSession): TableSession => ({
          ...sess,
          cart: sess.cart.map(l => l.menuItemId === menuItemId ? { ...l, qty: Math.max(1, qty) } : l)
                         .filter(l => l.qty > 0),
        });
        const s = get();
        if (s.walkInSession) set({ walkInSession: update(s.walkInSession) });
        else if (s.activePosTableId && s.tableSessions[s.activePosTableId]) {
          set({ tableSessions: { ...s.tableSessions, [s.activePosTableId]: update(s.tableSessions[s.activePosTableId]) } });
        }
      },

      removeFromCart: (menuItemId) => {
        const update = (sess: TableSession): TableSession => ({ ...sess, cart: sess.cart.filter(l => l.menuItemId !== menuItemId) });
        const s = get();
        if (s.walkInSession) set({ walkInSession: update(s.walkInSession) });
        else if (s.activePosTableId && s.tableSessions[s.activePosTableId]) {
          set({ tableSessions: { ...s.tableSessions, [s.activePosTableId]: update(s.tableSessions[s.activePosTableId]) } });
        }
      },

      setCartNotes: (menuItemId, notes) => {
        const update = (sess: TableSession): TableSession => ({ ...sess, cart: sess.cart.map(l => l.menuItemId === menuItemId ? { ...l, notes } : l) });
        const s = get();
        if (s.walkInSession) set({ walkInSession: update(s.walkInSession) });
        else if (s.activePosTableId && s.tableSessions[s.activePosTableId]) {
          set({ tableSessions: { ...s.tableSessions, [s.activePosTableId]: update(s.tableSessions[s.activePosTableId]) } });
        }
      },

      setDiscount: (d) => {
        const update = (sess: TableSession): TableSession => ({ ...sess, discount: Math.max(0, d) });
        const s = get();
        if (s.walkInSession) set({ walkInSession: update(s.walkInSession) });
        else if (s.activePosTableId && s.tableSessions[s.activePosTableId]) {
          set({ tableSessions: { ...s.tableSessions, [s.activePosTableId]: update(s.tableSessions[s.activePosTableId]) } });
        }
      },

      setCustomer: (id) => {
        const update = (sess: TableSession): TableSession => ({ ...sess, customerId: id });
        const s = get();
        if (s.walkInSession) set({ walkInSession: update(s.walkInSession) });
        else if (s.activePosTableId && s.tableSessions[s.activePosTableId]) {
          set({ tableSessions: { ...s.tableSessions, [s.activePosTableId]: update(s.tableSessions[s.activePosTableId]) } });
        }
      },

      clearNewItems: () => {
        const update = (sess: TableSession): TableSession => ({ ...sess, cart: [], discount: 0 });
        const s = get();
        if (s.walkInSession) set({ walkInSession: update(s.walkInSession) });
        else if (s.activePosTableId && s.tableSessions[s.activePosTableId]) {
          set({ tableSessions: { ...s.tableSessions, [s.activePosTableId]: update(s.tableSessions[s.activePosTableId]) } });
        }
      },

      closeTableSession: (tableId) => {
        const sessions = { ...get().tableSessions };
        delete sessions[tableId];
        const next: Partial<AppState> = { tableSessions: sessions };
        if (get().activePosTableId === tableId) {
          next.activePosTableId = null;
          next.posMode = 'floor';
        }
        set(next as any);
      },

      login: async (email, password) => {
        const data = await authAPI.login(email, password);
        set({
          user: data.user,
          activeRestaurantId: data.user.role === 'restaurant' ? data.user.entityId : null,
          posMode: 'floor',
          activePosTableId: null,
          tableSessions: {},
          walkInSession: null,
        });
        return data;
      },

      logout: async () => {
        await authAPI.logout();
        set({ user: null, posMode: 'floor', activePosTableId: null, tableSessions: {}, walkInSession: null });
      },
    }),
    {
      name: 'pp-app-store-v3',
      partialize: (s) => ({ user: s.user, activeRestaurantId: s.activeRestaurantId }),
    }
  )
);

// Backward-compat shim — pages still using cartTableId
export const useCartCompat = () => {
  const s = useAppStore();
  const sess = s.getActiveSession();
  return {
    cartType: sess?.orderType ?? 'dine-in',
    cartTableId: sess?.tableId === '__walkin__' ? undefined : sess?.tableId,
    cartCustomerId: sess?.customerId,
    cartDiscount: sess?.discount ?? 0,
    cart: sess?.cart ?? [],
    setCartType: s.selectWalkIn,
    setCartTable: (id?: string) => id && s.selectTable(id, id),
    setCartCustomer: s.setCustomer,
    setCartDiscount: s.setDiscount,
    addToCart: s.addToCart,
    updateCartQty: s.updateCartQty,
    removeFromCart: s.removeFromCart,
    setCartNotes: s.setCartNotes,
    clearCart: s.clearNewItems,
  };
};

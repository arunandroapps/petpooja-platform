import { useMemo, useState, useRef, useCallback } from 'react';
import {
  Search, Plus, Minus, Trash2, Receipt, Save, UserPlus, Tag, X,
  AlertCircle, CheckCircle2, Phone, Leaf, Drumstick, Printer,
  LayoutGrid, ChevronLeft, Clock, Users, Coffee, Bike, Globe,
  ArrowRight, RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import { useAppStore } from '../../store/useAppStore';
import type { OrderType } from '../../types';
import { fmtMoney, ago } from '../../utils/format';
import Modal from '../../components/Modal';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const matchId = (a: any, b: any) =>
  a && b && (a === b || a === b?._id || a?._id === b || a?._id === b?._id);

const TABLE_STATUS_COLOR: Record<string, string> = {
  free: 'bg-emerald-50 border-emerald-400 text-emerald-800',
  occupied: 'bg-red-50 border-red-400 text-red-800',
  reserved: 'bg-amber-50 border-amber-400 text-amber-800',
  cleaning: 'bg-slate-100 border-slate-300 text-slate-500',
};

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ msg, type = 'error', onClose }: { msg: string; type?: 'error' | 'success'; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

/* ─── Customer Modal ──────────────────────────────────────────────────────── */
function CustomerModal({ customers, onSelect, onCreate, onClose }: any) {
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const filtered = q.length >= 2
    ? customers.filter((c: any) => c.phone.includes(q) || c.name.toLowerCase().includes(q.toLowerCase()))
    : customers.slice(0, 8);
  return (
    <Modal open onClose={onClose} title="Attach Customer"
      footer={creating ? (
        <><button onClick={() => setCreating(false)} className="btn-secondary">Back</button>
          <button onClick={() => { if (name && phone) { onCreate(name, phone); onClose(); } }} className="btn-primary">Create & Attach</button></>
      ) : undefined}>
      {!creating ? (
        <div className="space-y-3">
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} autoFocus placeholder="Search by phone or name..." className="input pl-9" />
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {filtered.length === 0 ? <div className="text-center text-slate-400 text-sm py-6">No results</div> : filtered.map((c: any) => (
              <button key={c._id} onClick={() => { onSelect(c._id); onClose(); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-50 text-left">
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.phone} · ⭐ {c.loyaltyPoints} pts · {c.visits} visits</div>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            ))}
          </div>
          <button onClick={() => setCreating(true)} className="w-full btn-secondary text-sm"><UserPlus size={14} />New Customer</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div><label className="label">Name *</label><input value={name} onChange={e => setName(e.target.value)} className="input" /></div>
          <div><label className="label">Phone *</label><input value={phone} onChange={e => setPhone(e.target.value)} className="input" type="tel" /></div>
        </div>
      )}
    </Modal>
  );
}

/* ─── Bill Preview Modal ──────────────────────────────────────────────────── */
function BillPreview({ session, onPay, onClose, paying }: any) {
  const [method, setMethod] = useState<string | null>(null);
  const allItems = [...(session.existingItems || []), ...(session.cart || [])];
  const existSub = (session.existingItems || []).reduce((a: number, it: any) => a + it.price * it.qty, 0);
  const cartSub = (session.cart || []).reduce((a: number, it: any) => a + it.price * it.qty, 0);
  const subtotal = existSub + cartSub;
  const disc = Math.min(session.discount || 0, subtotal);
  const tax = Math.round((subtotal - disc) * 0.05);
  const total = subtotal - disc + tax;

  const methods = [{ id: 'cash', label: 'Cash', icon: '💵' }, { id: 'card', label: 'Card', icon: '💳' }, { id: 'upi', label: 'UPI', icon: '📱' }, { id: 'wallet', label: 'Wallet', icon: '👛' }];

  return (
    <Modal open onClose={onClose} title={`Bill — ${session.tableName}`} size="md"
      footer={
        <div className="w-full">
          {!method
            ? <p className="text-xs text-amber-600 font-medium">↑ Select a payment method to confirm</p>
            : <button onClick={() => onPay(method, total, subtotal, disc, tax)} disabled={paying}
                className="w-full btn-primary py-3 text-base disabled:opacity-60">
                {paying ? 'Processing…' : `Confirm & Pay ${fmtMoney(total)} via ${method.toUpperCase()}`}
              </button>
          }
        </div>
      }>
      {/* Items */}
      {session.existingItems?.length > 0 && (
        <div className="mb-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 px-1">Already in kitchen</div>
          <div className="bg-slate-50 rounded-lg divide-y divide-slate-100 border border-slate-100">
            {session.existingItems.map((it: any, i: number) => (
              <div key={i} className="flex justify-between px-3 py-2 text-sm">
                <span>{it.qty} × {it.name}</span>
                <span className="font-medium">{fmtMoney(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {session.cart?.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold mb-1 px-1">New items (this round)</div>
          <div className="bg-emerald-50 rounded-lg divide-y divide-emerald-100 border border-emerald-100">
            {session.cart.map((it: any, i: number) => (
              <div key={i} className="flex justify-between px-3 py-2 text-sm">
                <span>{it.qty} × {it.name}{it.notes && <span className="text-xs text-slate-400 italic"> ({it.notes})</span>}</span>
                <span className="font-medium">{fmtMoney(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Totals */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 mb-5 text-sm">
        {existSub > 0 && cartSub > 0 && (
          <>
            <div className="flex justify-between text-slate-500"><span>Previous items</span><span>{fmtMoney(existSub)}</span></div>
            <div className="flex justify-between text-emerald-600"><span>This round</span><span>{fmtMoney(cartSub)}</span></div>
          </>
        )}
        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
        {disc > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {fmtMoney(disc)}</span></div>}
        <div className="flex justify-between text-slate-600"><span>GST (5%)</span><span>+ {fmtMoney(tax)}</span></div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 text-slate-900">
          <span>Total Payable</span><span className="text-brand-600">{fmtMoney(total)}</span>
        </div>
      </div>
      {/* Payment method */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Method</p>
        <div className="grid grid-cols-4 gap-2">
          {methods.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition
                ${method === m.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50'}`}>
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Floor Map Panel ─────────────────────────────────────────────────────── */
function FloorMap({ tables, activeSessions, onSelectTable, onSelectWalkIn }: any) {
  const areas = [...new Set(tables.map((t: any) => t.area))];
  return (
    <div className="h-full overflow-y-auto bg-white border-r border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-slate-800">🗺️ Floor Plan</div>
        <div className="flex gap-1 text-[10px] flex-col">
          {[['bg-emerald-400', 'Free'], ['bg-red-400', 'Occupied'], ['bg-amber-400', 'Reserved'], ['bg-slate-300', 'Cleaning']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c}`} />{l}</div>
          ))}
        </div>
      </div>

      {areas.map((area: any) => (
        <div key={area} className="mb-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{area}</div>
          <div className="grid grid-cols-3 gap-2">
            {tables.filter((t: any) => t.area === area).map((t: any) => {
              const hasSession = !!activeSessions[t._id];
              const sessionCart = activeSessions[t._id]?.cart || [];
              const newItemsCount = sessionCart.reduce((a: number, l: any) => a + l.qty, 0);
              return (
                <button key={t._id}
                  onClick={() => onSelectTable(t)}
                  className={`relative rounded-xl border-2 p-2 text-center transition hover:scale-105 hover:shadow-md
                    ${TABLE_STATUS_COLOR[t.status] || TABLE_STATUS_COLOR.free}
                    ${hasSession ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-[10px] opacity-70">{t.seats}p</div>
                  <div className="text-[9px] uppercase font-semibold opacity-60">{t.status}</div>
                  {/* Unsent items badge */}
                  {newItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                      {newItemsCount}
                    </span>
                  )}
                  {/* Time badge for occupied */}
                  {t.status === 'occupied' && t.currentOrderId && (
                    <div className="text-[9px] text-red-600 font-medium mt-0.5">⏱ Active</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Walk-in options */}
      <div className="border-t border-slate-200 pt-4 mt-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Walk-in</div>
        <div className="grid grid-cols-1 gap-2">
          {([['takeaway', 'Takeaway', Coffee], ['delivery', 'Delivery', Bike], ['online', 'Online', Globe]] as const).map(([type, label, Icon]) => (
            <button key={type} onClick={() => onSelectWalkIn(type)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-sm text-slate-700 transition">
              <Icon size={14} className="text-slate-400" />{label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main POS ────────────────────────────────────────────────────────────── */
export default function RstPOS() {
  const qc = useQueryClient();
  const store = useAppStore();
  const session = store.getActiveSession();

  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non'>('all');
  const [showBill, setShowBill] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);
  const billHtmlRef = useRef<string>('');

  const showToast = useCallback((msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  }, []);

  // Queries — tables refresh every 8 seconds for real-time sync
  const { data: tables = [], refetch: refetchTables } = useQuery({
    queryKey: ['rst-tables'], queryFn: rstAPI.getTables, refetchInterval: 8000,
  });
  const { data: cats = [] } = useQuery({ queryKey: ['rst-categories'], queryFn: rstAPI.getCategories });
  const { data: menuItems = [] } = useQuery({ queryKey: ['rst-menu'], queryFn: rstAPI.getMenuItems });
  const { data: activeOrders = [] } = useQuery({
    queryKey: ['rst-active-orders'], queryFn: rstAPI.getActiveOrders, refetchInterval: 6000,
  });
  const { data: custData } = useQuery({ queryKey: ['rst-customers-list'], queryFn: () => rstAPI.getCustomers() });
  const customers = custData?.customers || [];

  // Filtered menu
  const filteredMenu = useMemo(() => (menuItems as any[]).filter(m => {
    const catMatch = activeCat === 'all' || matchId(m.categoryId, activeCat);
    const searchMatch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const vegMatch = vegFilter === 'all' || (vegFilter === 'veg' ? m.veg : !m.veg);
    return catMatch && searchMatch && vegMatch && m.available;
  }), [menuItems, activeCat, search, vegFilter]);

  // Totals from session
  const existingItems = session?.existingItems || [];
  const cart = session?.cart || [];
  const existingSub = existingItems.reduce((a: number, it: any) => a + it.price * it.qty, 0);
  const cartSub = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const totalSub = existingSub + cartSub;
  const disc = Math.min(session?.discount || 0, totalSub);
  const taxAmount = Math.round((totalSub - disc) * 0.05);
  const grandTotal = totalSub - disc + taxAmount;

  const selectedTable = (tables as any[]).find(t => matchId(t._id, session?.tableId));
  const customer = customers.find((c: any) => matchId(c._id, session?.customerId));

  // Handle table click from floor map
  const handleSelectTable = async (table: any) => {
    if (table.status === 'occupied') {
      // Load existing order for this table
      try {
        const active = (activeOrders as any[]).find((o: any) =>
          o.tableId?._id === table._id || o.tableId === table._id
        );
        store.selectTable(table._id, table.name, active || null);
        if (active) showToast(`Loaded existing order #${active.number} for ${table.name}`, 'success');
      } catch {
        store.selectTable(table._id, table.name);
      }
    } else if (table.status === 'reserved') {
      store.selectTable(table._id, table.name);
      showToast(`${table.name} is reserved — confirm with guest before seating`, 'error');
    } else if (table.status === 'cleaning') {
      showToast(`${table.name} is being cleaned — please wait`, 'error');
    } else {
      store.selectTable(table._id, table.name);
    }
  };

  // Validate before KOT/Pay
  const validate = () => {
    if (cart.length === 0 && existingItems.length === 0) { showToast('Cart is empty — add items first'); return false; }
    if (cart.length === 0 && existingItems.length > 0 && !showBill) { return true; } // going to pay with existing items only
    return true;
  };

  // Save KOT — send NEW cart items to kitchen
  const saveKOT = useMutation({
    mutationFn: async () => {
      if (!session || cart.length === 0) throw new Error('No new items to send');
      const items = cart.map(l => ({ menuItemId: l.menuItemId, name: l.name, price: l.price, qty: l.qty, notes: l.notes }));

      if (session.activeOrderId) {
        // Add items to existing order
        return rstAPI.addItemsToOrder(session.activeOrderId, items);
      } else {
        // Create new order (KOT)
        return rstAPI.placeOrder({
          type: session.orderType,
          tableId: session.tableId !== '__walkin__' ? session.tableId : undefined,
          customerId: session.customerId,
          items,
          discount: 0,
          payment: 'unpaid',
        });
      }
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['rst-active-orders', 'rst-tables', 'rst-orders'] });
      refetchTables();
      // Update session: move cart to existingItems, set activeOrderId
      const tableId = session!.tableId;
      const newExisting = [...existingItems, ...cart.map(l => ({ ...l, status: 'new' }))];
      if (tableId !== '__walkin__') {
        store.selectTable(tableId, session!.tableName, {
          _id: order._id || session!.activeOrderId,
          items: newExisting,
        });
      }
      store.clearNewItems();
      showToast(`✅ KOT sent to kitchen — Order #${order.number || ''}`, 'success');
    },
    onError: (e: any) => showToast(e?.message || 'Failed to send KOT'),
  });

  // Place/complete order (Pay Now)
  const placeOrder = useMutation({
    mutationFn: async ({ payment }: { payment: string }) => {
      if (!session) throw new Error('No active session');
      const allCartItems = cart.map(l => ({ menuItemId: l.menuItemId, name: l.name, price: l.price, qty: l.qty, notes: l.notes }));

      if (session.activeOrderId) {
        // Add remaining cart items first, then pay
        if (allCartItems.length > 0) {
          await rstAPI.addItemsToOrder(session.activeOrderId, allCartItems);
        }
        return rstAPI.payOrder(session.activeOrderId, payment);
      } else {
        // New order (direct pay)
        const allItems = [...existingItems.map((it: any) => ({ menuItemId: it.menuItemId, name: it.name, price: it.price, qty: it.qty, notes: it.notes })), ...allCartItems];
        return rstAPI.placeOrder({
          type: session.orderType,
          tableId: session.tableId !== '__walkin__' ? session.tableId : undefined,
          customerId: session.customerId,
          items: allItems.length > 0 ? allItems : allCartItems,
          discount: disc,
          payment,
        });
      }
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['rst-orders', 'rst-tables', 'rst-active-orders', 'rst-today'] });
      refetchTables();
      // Close table session
      if (session?.tableId && session.tableId !== '__walkin__') {
        store.closeTableSession(session.tableId);
      } else {
        store.clearNewItems();
        store.clearPosSelection();
      }
      setShowBill(false);
      setSuccessOrder(order);
    },
    onError: () => showToast('Failed to place order. Try again.'),
  });

  const createCustomer = (name: string, phone: string) => {
    rstAPI.createCustomer({ name, phone }).then(c => {
      qc.invalidateQueries({ queryKey: ['rst-customers-list'] });
      store.setCustomer(c._id);
    });
  };

  const buildBillHtml = (order: any) =>
    `<html><head><title>Bill #${order.number}</title>
    <style>body{font-family:'Courier New',monospace;max-width:320px;margin:0 auto;padding:16px;font-size:13px}
    h2{text-align:center}hr{border-top:1px dashed #000}.row{display:flex;justify-content:space-between}
    @media print{.no-print{display:none}}</style></head><body>
    <h2>Pet Pooja</h2><div style="text-align:center;font-size:11px">Spice Route — Bandra</div><hr/>
    <div class="row"><span>Bill #${order.number}</span><span>${(order.type || '').toUpperCase()}</span></div>
    ${order.tableId ? `<div>Table: ${typeof order.tableId === 'object' ? order.tableId.name : order.tableId}</div>` : ''}
    <div style="font-size:11px">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}</div><hr/>
    ${(order.items || []).map((it: any) => `<div class="row"><span>${it.qty}× ${it.name}</span><span>₹${it.qty * it.price}</span></div>`).join('')}
    <hr/><div class="row"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
    ${order.discount ? `<div class="row"><span>Discount</span><span>-₹${order.discount}</span></div>` : ''}
    <div class="row"><span>GST 5%</span><span>₹${order.taxAmount}</span></div><hr/>
    <div class="row" style="font-weight:bold;font-size:15px"><span>TOTAL</span><span>₹${order.total}</span></div><hr/>
    <div class="row"><span>Payment</span><span>${(order.payment || '').toUpperCase()}</span></div><hr/>
    <div style="text-align:center;font-size:11px">Thank you! Visit again 🙏</div>
    <br><button class="no-print" onclick="window.print()" style="width:100%;padding:10px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨️ Print</button>
    </body></html>`;

  const openPrint = (html: string) => {
    const w = window.open('', '_blank', 'width=420,height=640,toolbar=no,menubar=no');
    if (!w) { showToast('Allow popups for print'); return; }
    w.document.write(html); w.document.close();
  };

  /* ─────────────────────────────────────────── RENDER ─── */

  /* Floor mode — show full floor map */
  if (store.posMode === 'floor') {
    const occupied = (tables as any[]).filter((t: any) => t.status === 'occupied').length;
    const free = (tables as any[]).filter((t: any) => t.status === 'free').length;
    return (
      <div className="flex h-full">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Floor Plan</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {free} free · {occupied} occupied · {(tables as any[]).length} total tables
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => refetchTables()} className="btn-secondary text-sm"><RefreshCw size={14} />Refresh</button>
              <button onClick={() => store.selectWalkIn('takeaway')} className="btn-secondary text-sm"><Coffee size={14} />Takeaway</button>
              <button onClick={() => store.selectWalkIn('delivery')} className="btn-secondary text-sm"><Bike size={14} />Delivery</button>
              <button onClick={() => store.selectWalkIn('online')} className="btn-secondary text-sm"><Globe size={14} />Online</button>
            </div>
          </div>

          {/* Active sessions indicator */}
          {Object.keys(store.tableSessions).length > 0 && (
            <div className="card p-4 mb-5 border-l-4 border-brand-500 bg-brand-50">
              <div className="text-sm font-semibold text-brand-800 mb-2">
                📋 Active Sessions ({Object.keys(store.tableSessions).length})
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(store.tableSessions).map((s: any) => (
                  <button key={s.tableId} onClick={() => {
                    const t = (tables as any[]).find(t => t._id === s.tableId);
                    if (t) handleSelectTable(t);
                  }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-brand-300 hover:bg-brand-100 text-sm">
                    <span className="font-semibold">{s.tableName}</span>
                    {s.cart.length > 0 && <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-full">{s.cart.reduce((a: number, l: any) => a + l.qty, 0)} new</span>}
                    {s.existingItems.length > 0 && <span className="text-[10px] text-slate-500">{s.existingItems.length} in kitchen</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Table grid per area */}
          {[...new Set((tables as any[]).map((t: any) => t.area))].map((area: any) => (
            <div key={area} className="mb-8">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">{area}</div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {(tables as any[]).filter(t => t.area === area).map((t: any) => {
                  const activeOrder = (activeOrders as any[]).find(o => o.tableId?._id === t._id || o.tableId === t._id);
                  const sess = store.tableSessions[t._id];
                  const newItems = sess?.cart.reduce((a, l) => a + l.qty, 0) || 0;
                  return (
                    <button key={t._id} onClick={() => handleSelectTable(t)}
                      className={`relative aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center transition hover:scale-105 hover:shadow-lg
                        ${TABLE_STATUS_COLOR[t.status] || TABLE_STATUS_COLOR.free}
                        ${sess ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`}>
                      <div className="font-bold text-base">{t.name}</div>
                      <div className="text-[10px] opacity-70 font-medium">{t.seats}p</div>
                      <div className="text-[9px] uppercase font-bold opacity-60">{t.status}</div>
                      {activeOrder && (
                        <div className="text-[9px] text-red-600 font-medium mt-0.5">
                          ⏱ {ago(new Date(activeOrder.createdAt).getTime())}
                        </div>
                      )}
                      {newItems > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow">
                          {newItems}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  /* ── Billing mode — 3-panel layout ──────────────────────────────────────── */
  return (
    <div className="flex h-full overflow-hidden">

      {/* Left: Mini floor map */}
      <div className="w-44 shrink-0">
        <FloorMap
          tables={tables}
          activeSessions={store.tableSessions}
          onSelectTable={handleSelectTable}
          onSelectWalkIn={(type: OrderType) => store.selectWalkIn(type)}
        />
      </div>

      {/* Center: Menu */}
      <div className="flex-1 flex flex-col overflow-hidden border-x border-slate-200">
        {/* Toolbar */}
        <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => store.setPosMode('floor')} className="btn-ghost text-slate-600 text-sm px-2">
              <ChevronLeft size={16} />Floor
            </button>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." className="input pl-9 py-2 text-sm" />
            </div>
            <div className="flex gap-1">
              {[['all', 'All'], ['veg', '🌿'], ['non', '🍗']].map(([v, l]) => (
                <button key={v} onClick={() => setVegFilter(v as any)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition ${vegFilter === v ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setActiveCat('all')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${activeCat === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              All ({(menuItems as any[]).filter(m => m.available).length})
            </button>
            {(cats as any[]).map(c => (
              <button key={c._id} onClick={() => setActiveCat(c._id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${matchId(activeCat, c._id) ? 'text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                style={matchId(activeCat, c._id) ? { background: c.color || '#f97316' } : {}}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredMenu.length === 0 && <div className="text-center text-slate-400 py-16">No items match</div>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredMenu.map((m: any) => {
              const inCart = cart.find(l => l.menuItemId === m._id);
              const inKitchen = existingItems.find((it: any) => it.menuItemId === m._id || matchId(it.menuItemId, m._id));
              return (
                <button key={m._id} onClick={() => store.addToCart({ menuItemId: m._id, name: m.name, price: m.price })}
                  className="card text-left hover:border-brand-400 hover:shadow-md transition relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-0 h-0 border-l-[18px] border-l-transparent border-t-[18px] ${m.veg ? 'border-t-emerald-500' : 'border-t-red-500'}`} />
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 to-brand-50 flex items-center justify-center text-2xl rounded-t-xl">🍽️</div>
                  <div className="p-2">
                    <div className="font-medium text-xs text-slate-800 line-clamp-1">{m.name}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-brand-600 font-bold text-sm">{fmtMoney(m.price)}</span>
                      <span className="flex gap-1">
                        {inKitchen && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded">🔥{inKitchen.qty}</span>}
                        {inCart && <span className="text-[10px] bg-brand-100 text-brand-700 px-1 rounded">+{inCart.qty}</span>}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Order panel */}
      <div className="w-[360px] shrink-0 bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-slate-900">
                {session?.tableId === '__walkin__'
                  ? `${(session?.orderType || '').charAt(0).toUpperCase() + (session?.orderType || '').slice(1)}`
                  : `Table ${session?.tableName || ''}`}
              </div>
              {session?.activeOrderId && (
                <div className="text-[11px] text-amber-600 font-medium">📋 Adding to existing order</div>
              )}
            </div>
            <div className="flex gap-1">
              {/* Customer */}
              {customer
                ? <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700">
                    {customer.name.split(' ')[0]}<button onClick={() => store.setCustomer(undefined)}><X size={10} /></button>
                  </div>
                : <button onClick={() => setShowCustomer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                    <UserPlus size={11} />Guest
                  </button>
              }
            </div>
          </div>
        </div>

        {/* Existing items (in kitchen) */}
        {existingItems.length > 0 && (
          <div className="border-b border-slate-200 bg-amber-50">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">🔥 In Kitchen ({existingItems.length} items)</span>
              <span className="text-xs font-semibold text-amber-700">{fmtMoney(existingSub)}</span>
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-amber-100 px-3">
              {existingItems.map((it: any, i: number) => (
                <div key={i} className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-600">{it.qty}× {it.name}</span>
                  <span className="text-slate-600">{fmtMoney(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 && existingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm py-12">
              <Receipt size={36} className="mb-2 text-slate-300" />
              <p className="font-medium">No items yet</p>
              <p className="text-xs mt-1">Add from menu →</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm px-4">
              <p className="font-medium">No new items</p>
              <p className="text-xs mt-1">Add more items or proceed to pay</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.length > 0 && (
                <div className="px-3 py-1.5 bg-emerald-50 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">✨ New items (this round)</span>
                  <span className="text-xs font-semibold text-emerald-700">{fmtMoney(cartSub)}</span>
                </div>
              )}
              {cart.map(it => (
                <div key={it.menuItemId} className="px-3 py-2.5">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 pr-2">
                      <div className="text-sm font-medium text-slate-900">{it.name}</div>
                      <div className="text-xs text-slate-400">{fmtMoney(it.price)} each</div>
                    </div>
                    <div className="text-sm font-semibold">{fmtMoney(it.price * it.qty)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => store.updateCartQty(it.menuItemId, it.qty - 1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Minus size={11} /></button>
                      <span className="text-sm font-bold w-4 text-center">{it.qty}</span>
                      <button onClick={() => store.updateCartQty(it.menuItemId, it.qty + 1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Plus size={11} /></button>
                    </div>
                    <button onClick={() => store.removeFromCart(it.menuItemId)} className="text-slate-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                  <input value={it.notes || ''} onChange={e => store.setCartNotes(it.menuItemId, e.target.value)}
                    placeholder="Special instruction..." className="mt-1.5 w-full text-xs px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 focus:outline-none focus:border-brand-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bill summary + actions */}
        {(cart.length > 0 || existingItems.length > 0) && (
          <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-2">
            {/* Discount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-slate-600"><Tag size={12} />Discount</div>
              <input type="number" min={0} max={totalSub} value={session?.discount || ''}
                onChange={e => { const v = +e.target.value || 0; if (v > totalSub) showToast(`Max discount: ${fmtMoney(totalSub)}`); store.setDiscount(Math.min(v, totalSub)); }}
                placeholder="0" className="w-20 text-right text-sm bg-white px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-400" />
            </div>
            {/* Summary */}
            <div className="bg-white rounded-xl border border-slate-100 px-3 py-2 space-y-1 text-sm">
              {existingSub > 0 && <div className="flex justify-between text-amber-600"><span>In kitchen</span><span>{fmtMoney(existingSub)}</span></div>}
              {cartSub > 0 && <div className="flex justify-between text-emerald-600"><span>New items</span><span>{fmtMoney(cartSub)}</span></div>}
              {disc > 0 && <div className="flex justify-between text-slate-500"><span>Discount</span><span>−{fmtMoney(disc)}</span></div>}
              <div className="flex justify-between text-slate-500"><span>GST (5%)</span><span>+{fmtMoney(taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100">
                <span>Total</span><span className="text-brand-600">{fmtMoney(grandTotal)}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-center">
              {cart.reduce((a, b) => a + b.qty, 0) + existingItems.reduce((a: number, it: any) => a + it.qty, 0)} item(s) total
            </div>
            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => saveKOT.mutate()} disabled={saveKOT.isPending || cart.length === 0}
                className="btn-secondary text-sm py-2.5 disabled:opacity-50">
                <Save size={14} />{session?.activeOrderId ? 'Add KOT' : 'Save KOT'}
              </button>
              <button onClick={() => { if (validate()) setShowBill(true); }}
                className="btn-primary text-sm py-2.5 font-semibold">
                <Receipt size={14} />Pay Bill
              </button>
            </div>
            {cart.length > 0 && (
              <button onClick={() => store.clearNewItems()} className="w-full text-xs text-red-400 hover:text-red-600 py-1">
                🗑 Clear new items
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCustomer && (
        <CustomerModal customers={customers} onSelect={(id: string) => store.setCustomer(id)} onCreate={createCustomer} onClose={() => setShowCustomer(false)} />
      )}

      {showBill && session && (
        <BillPreview
          session={session}
          paying={placeOrder.isPending}
          onPay={(payment: string) => placeOrder.mutate({ payment })}
          onClose={() => setShowBill(false)}
        />
      )}

      {/* Success modal */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Bill Settled! ✅</h2>
            <p className="text-slate-500 text-sm mb-2">Order <span className="font-bold text-slate-900">#{successOrder.number}</span></p>
            <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="uppercase font-medium">{successOrder.payment}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2 mt-1">
                <span>Total Paid</span><span className="text-brand-600">{fmtMoney(successOrder.total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { billHtmlRef.current = buildBillHtml(successOrder); openPrint(billHtmlRef.current); }} className="btn-secondary py-2.5">
                <Printer size={15} />Print Bill
              </button>
              <button onClick={() => { setSuccessOrder(null); store.setPosMode('floor'); }} className="btn-primary py-2.5">
                Next Table →
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

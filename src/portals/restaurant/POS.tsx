import { useMemo, useState, useRef } from 'react';
import {
  Search, Plus, Minus, Trash2, Receipt, Save, UserPlus, Tag, X,
  ChevronRight, AlertCircle, CheckCircle2, Phone, MapPin, Leaf, Drumstick, Printer,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import { useAppStore } from '../../store/useAppStore';
import type { OrderType } from '../../types';
import { fmtMoney } from '../../utils/format';
import Modal from '../../components/Modal';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Step = 'setup' | 'billing';
type PayMethod = 'cash' | 'card' | 'upi' | 'wallet';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const matchId = (a: any, b: any) =>
  a && b && (a === b || a === b?._id || a?._id === b || a?._id === b?._id);

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium">
      <AlertCircle size={16} />{msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

/* ─── Table Picker Modal ─────────────────────────────────────────────────── */
function TablePicker({ tables, selected, onSelect, onClose }: any) {
  const areas = [...new Set(tables.map((t: any) => t.area))];
  const statusColor: Record<string, string> = {
    free: 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200',
    occupied: 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-60',
    reserved: 'bg-amber-100 border-amber-400 text-amber-800',
    cleaning: 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed opacity-60',
  };
  return (
    <Modal open onClose={onClose} title="Select Table" size="lg">
      <div className="flex gap-4 text-xs mb-4">
        {['free', 'occupied', 'reserved', 'cleaning'].map(s => (
          <div key={s} className="flex items-center gap-1.5 capitalize">
            <span className={`w-3 h-3 rounded border ${statusColor[s].split(' ')[0]} ${statusColor[s].split(' ')[1]}`} />{s}
          </div>
        ))}
      </div>
      {areas.map((area: any) => (
        <div key={area} className="mb-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{area}</div>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {tables.filter((t: any) => t.area === area).map((t: any) => (
              <button key={t._id}
                disabled={t.status !== 'free' && !matchId(t._id, selected)}
                onClick={() => { onSelect(t._id); onClose(); }}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-sm transition
                  ${matchId(t._id, selected) ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200' : statusColor[t.status] || statusColor.free}`}>
                <div className="font-bold">{t.name}</div>
                <div className="text-[10px]">{t.seats}p</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
}

/* ─── Customer Search Modal ─────────────────────────────────────────────── */
function CustomerModal({ customers, onSelect, onCreate, onClose }: any) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const filtered = phone.length >= 3
    ? customers.filter((c: any) => c.phone.includes(phone) || c.name.toLowerCase().includes(phone.toLowerCase()))
    : customers.slice(0, 8);

  return (
    <Modal open onClose={onClose} title="Attach Customer"
      footer={creating ? (
        <>
          <button onClick={() => setCreating(false)} className="btn-secondary">Back</button>
          <button onClick={() => { if (name && phone) { onCreate(name, phone); onClose(); } }} className="btn-primary">Create & Attach</button>
        </>
      ) : undefined}>
      {!creating ? (
        <div className="space-y-3">
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input value={phone} onChange={e => setPhone(e.target.value)} autoFocus
              placeholder="Search by phone or name..." className="input pl-9" />
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {filtered.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-6">No customers found</div>
            )}
            {filtered.map((c: any) => (
              <button key={c._id} onClick={() => { onSelect(c._id); onClose(); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-50 text-left transition">
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.phone} · {c.visits} visits · ⭐ {c.loyaltyPoints} pts</div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            ))}
          </div>
          <button onClick={() => setCreating(true)}
            className="w-full btn-secondary text-sm"><UserPlus size={15} />New Customer</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div><label className="label">Customer Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Full name" /></div>
          <div><label className="label">Phone Number *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="10-digit mobile" type="tel" /></div>
        </div>
      )}
    </Modal>
  );
}

/* ─── Bill Preview Modal ─────────────────────────────────────────────────── */
function BillPreview({ cart, subtotal, discount, taxAmount, serviceCharge, total, onPay, onClose, paying }: any) {
  const [method, setMethod] = useState<PayMethod | null>(null);
  const methods = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'upi', label: 'UPI', icon: '📱' },
    { id: 'wallet', label: 'Wallet', icon: '👛' },
  ];
  return (
    <Modal open onClose={onClose} title="Bill Preview & Payment" size="md"
      footer={
        <div className="w-full">
          {!method ? (
            <p className="text-xs text-amber-600 font-medium">↑ Select a payment method to confirm</p>
          ) : (
            <button onClick={() => onPay(method)} disabled={paying}
              className="w-full btn-primary py-3 text-base disabled:opacity-60">
              {paying ? 'Processing…' : `Confirm & Pay ${fmtMoney(total)} via ${method.toUpperCase()}`}
            </button>
          )}
        </div>
      }>
      {/* Items */}
      <div className="max-h-40 overflow-y-auto mb-4 divide-y divide-slate-100 border border-slate-100 rounded-lg">
        {cart.map((it: any) => (
          <div key={it.menuItemId} className="flex justify-between px-3 py-2 text-sm">
            <span className="flex-1">{it.qty} × {it.name}{it.notes && <span className="text-slate-400 italic text-xs"> ({it.notes})</span>}</span>
            <span className="font-medium">{fmtMoney(it.price * it.qty)}</span>
          </div>
        ))}
      </div>
      {/* Totals */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 mb-5 text-sm">
        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {fmtMoney(discount)}</span></div>}
        {serviceCharge > 0 && <div className="flex justify-between text-slate-600"><span>Service Charge</span><span>+ {fmtMoney(serviceCharge)}</span></div>}
        <div className="flex justify-between text-slate-600"><span>GST (5%)</span><span>+ {fmtMoney(taxAmount)}</span></div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 text-slate-900">
          <span>Total Payable</span><span className="text-brand-600">{fmtMoney(total)}</span>
        </div>
      </div>
      {/* Payment method */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Choose Payment Method</p>
        <div className="grid grid-cols-4 gap-2">
          {methods.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id as PayMethod)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition text-sm font-medium
                ${method === m.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50'}`}>
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main POS ───────────────────────────────────────────────────────────── */
export default function RstPOS() {
  const qc = useQueryClient();
  const {
    cart, cartType, cartTableId, cartCustomerId, cartDiscount,
    addToCart, updateCartQty, removeFromCart, setCartNotes,
    setCartType, setCartTable, setCartCustomer, setCartDiscount, clearCart,
  } = useAppStore();

  // Data
  const { data: cats = [] } = useQuery({ queryKey: ['rst-categories'], queryFn: rstAPI.getCategories });
  const { data: menuItems = [] } = useQuery({ queryKey: ['rst-menu'], queryFn: rstAPI.getMenuItems });
  const { data: tables = [] } = useQuery({ queryKey: ['rst-tables'], queryFn: rstAPI.getTables });
  const { data: custData } = useQuery({ queryKey: ['rst-customers-list'], queryFn: () => rstAPI.getCustomers() });
  const customers = custData?.customers || [];

  // UI State
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non'>('all');
  const [showBill, setShowBill] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [toast, setToast] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const billHtmlRef = useRef<string>('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Derived
  const selectedTable = (tables as any[]).find(t => matchId(t._id, cartTableId));
  const customer = customers.find((c: any) => matchId(c._id, cartCustomerId));

  const filteredMenu = useMemo(() => {
    return (menuItems as any[]).filter(m => {
      const catMatch = activeCat === 'all' || matchId(m.categoryId, activeCat);
      const searchMatch = search === '' || m.name.toLowerCase().includes(search.toLowerCase());
      const vegMatch = vegFilter === 'all' || (vegFilter === 'veg' ? m.veg : !m.veg);
      return catMatch && searchMatch && vegMatch && m.available;
    });
  }, [menuItems, activeCat, search, vegFilter]);

  // Totals
  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const disc = Math.min(cartDiscount, subtotal);
  const afterDiscount = subtotal - disc;
  const taxAmount = Math.round(afterDiscount * 0.05);
  const serviceCharge = 0; // from restaurant settings
  const total = afterDiscount + taxAmount + serviceCharge;

  // Validation
  const validate = (): boolean => {
    if (cart.length === 0) { showToast('Cart is empty — add items first'); return false; }
    if (cartType === 'dine-in' && !cartTableId) { showToast('Please select a table for dine-in'); setShowTablePicker(true); return false; }
    if (cartType === 'delivery' && !deliveryAddr.trim()) { showToast('Delivery address is required'); return false; }
    return true;
  };

  // Mutations
  const placeOrder = useMutation({
    mutationFn: (payment: string) => rstAPI.placeOrder({
      type: cartType,
      tableId: cartTableId || undefined,
      customerId: cartCustomerId || undefined,
      items: cart.map(l => ({ menuItemId: l.menuItemId, name: l.name, price: l.price, qty: l.qty, notes: l.notes })),
      discount: disc,
      payment,
      notes: deliveryAddr ? `Delivery: ${deliveryAddr}` : undefined,
    }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['rst-orders'] });
      qc.invalidateQueries({ queryKey: ['rst-tables'] });
      qc.invalidateQueries({ queryKey: ['rst-customers-list'] });
      qc.invalidateQueries({ queryKey: ['rst-today'] });
      billHtmlRef.current = buildBillHtml(order);
      clearCart();
      setDeliveryAddr('');
      setShowBill(false);
      setSuccessOrder(order);
    },
    onError: () => showToast('Failed to place order. Try again.'),
  });

  const saveKOT = useMutation({
    mutationFn: () => {
      if (!validate()) return Promise.reject();
      return rstAPI.placeOrder({
        type: cartType,
        tableId: cartTableId || undefined,
        customerId: cartCustomerId || undefined,
        items: cart.map(l => ({ menuItemId: l.menuItemId, name: l.name, price: l.price, qty: l.qty, notes: l.notes })),
        discount: disc,
        payment: 'unpaid',
        notes: deliveryAddr ? `Delivery: ${deliveryAddr}` : undefined,
      });
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['rst-orders'] });
      qc.invalidateQueries({ queryKey: ['rst-tables'] });
      qc.invalidateQueries({ queryKey: ['rst-active-orders'] });
      clearCart();
      setDeliveryAddr('');
      showToast(`✅ KOT #${order.number} sent to kitchen`);
    },
    onError: (err: any) => { if (err) showToast('Failed to save KOT.'); },
  });

  const createCustomer = (name: string, phone: string) => {
    rstAPI.createCustomer({ name, phone }).then(c => {
      qc.invalidateQueries({ queryKey: ['rst-customers-list'] });
      setCartCustomer(c._id);
    });
  };

  // Build HTML for bill (non-blocking — user clicks Print when ready)
  const buildBillHtml = (order: any): string =>
    `<html><head><title>Bill #${order.number}</title>
    <style>body{font-family:'Courier New',monospace;max-width:320px;margin:0 auto;padding:16px;font-size:13px}
    h2{text-align:center;margin:0;font-size:16px}.divider{border-top:1px dashed #000;margin:8px 0}
    .row{display:flex;justify-content:space-between}.bold{font-weight:bold}.center{text-align:center}
    table{width:100%}td{vertical-align:top}@media print{.no-print{display:none}}</style></head><body>
    <h2>Pet Pooja</h2>
    <div class="center" style="font-size:11px">Spice Route — Bandra</div>
    <div class="divider"></div>
    <div class="row"><span>Bill #${order.number}</span><span>${order.type?.toUpperCase()}</span></div>
    ${order.tableId ? `<div>Table: ${typeof order.tableId === 'object' ? order.tableId.name : ''}</div>` : ''}
    <div style="font-size:11px">${new Date(order.createdAt).toLocaleString('en-IN')}</div>
    <div class="divider"></div>
    <table>${order.items.map((it: any) => `<tr><td>${it.qty}× ${it.name}</td><td style="text-align:right">₹${it.qty * it.price}</td></tr>`).join('')}</table>
    <div class="divider"></div>
    <div class="row"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
    ${order.discount ? `<div class="row"><span>Discount</span><span>-₹${order.discount}</span></div>` : ''}
    <div class="row"><span>GST (5%)</span><span>₹${order.taxAmount}</span></div>
    <div class="divider"></div>
    <div class="row bold" style="font-size:15px"><span>TOTAL</span><span>₹${order.total}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Payment</span><span>${order.payment?.toUpperCase()}</span></div>
    <div class="divider"></div>
    <div class="center" style="font-size:11px">Thank you! Visit again 🙏</div>
    <br><button class="no-print" onclick="window.print()" style="width:100%;padding:10px;background:#f97316;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">🖨️ Print</button>
    </body></html>`;

  const openPrintWindow = (html: string) => {
    const w = window.open('', '_blank', 'width=420,height=640,toolbar=no,menubar=no');
    if (!w) { showToast('Popup blocked — allow popups for this site'); return; }
    w.document.write(html);
    w.document.close();
  };

  const handlePayNow = () => {
    if (!validate()) return;
    setShowBill(true);
  };

  const handleConfirmPay = (method: PayMethod) => {
    placeOrder.mutate(method);
  };

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: Menu panel ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-slate-200 space-y-3">

          {/* Order type + search row */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['dine-in', 'takeaway', 'delivery', 'online'] as OrderType[]).map(t => (
                <button key={t} onClick={() => { setCartType(t); if (t !== 'dine-in') setCartTable(undefined); }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition
                    ${cartType === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{t}</button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search menu items..." className="input pl-9 py-2 text-sm" />
            </div>
            {/* Veg / Non-veg filter */}
            <div className="flex gap-1">
              <button onClick={() => setVegFilter('all')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${vegFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
              <button onClick={() => setVegFilter('veg')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium transition ${vegFilter === 'veg' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Leaf size={11} />Veg</button>
              <button onClick={() => setVegFilter('non')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium transition ${vegFilter === 'non' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Drumstick size={11} />Non-veg</button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            <button onClick={() => setActiveCat('all')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition
                ${activeCat === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              All <span className="text-[11px] opacity-70">({(menuItems as any[]).filter(m => m.available).length})</span>
            </button>
            {(cats as any[]).map(c => {
              const count = (menuItems as any[]).filter(m => matchId(m.categoryId, c._id) && m.available).length;
              return (
                <button key={c._id} onClick={() => setActiveCat(c._id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition
                    ${matchId(activeCat, c._id) ? 'text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  style={matchId(activeCat, c._id) ? { background: c.color || '#f97316' } : {}}>
                  {c.name} <span className="text-[11px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMenu.length === 0 && (
            <div className="text-center text-slate-400 py-16">
              <Search size={36} className="mx-auto mb-2 opacity-30" />
              No items match your filters
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredMenu.map((m: any) => {
              const inCart = cart.find(l => l.menuItemId === m._id);
              return (
                <button key={m._id} onClick={() => addToCart({ menuItemId: m._id, name: m.name, price: m.price })}
                  className="card text-left hover:border-brand-400 hover:shadow-md transition group relative overflow-hidden">
                  {/* Veg/Non-veg stripe */}
                  <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${m.veg ? 'border-t-emerald-500' : 'border-t-red-500'}`} />
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center text-3xl rounded-t-xl">
                    🍽️
                  </div>
                  <div className="p-2.5">
                    <div className="font-medium text-sm text-slate-800 line-clamp-1 mb-0.5">{m.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-600 font-bold text-sm">{fmtMoney(m.price)}</span>
                      {inCart ? (
                        <span className="flex items-center gap-1 text-[11px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-semibold">
                          {inCart.qty} in cart
                        </span>
                      ) : (
                        <span className="text-[11px] text-brand-600 opacity-0 group-hover:opacity-100 font-medium transition">+ Add</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: Order panel ─────────────────────────────────────────── */}
      <div className="w-[380px] shrink-0 bg-white border-l border-slate-200 flex flex-col">

        {/* Order setup header */}
        <div className="px-4 py-3 border-b border-slate-200 space-y-2">

          {/* Table / Delivery info */}
          {cartType === 'dine-in' && (
            <button onClick={() => setShowTablePicker(true)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition
                ${!cartTableId ? 'border-red-300 bg-red-50 text-red-700' : 'border-emerald-400 bg-emerald-50 text-emerald-800'}`}>
              <span>{selectedTable ? `Table ${selectedTable.name} · ${selectedTable.area} · ${selectedTable.seats} seats` : '⚠️ Select a table (required)'}</span>
              <ChevronRight size={16} />
            </button>
          )}
          {cartType === 'delivery' && (
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)}
                placeholder="Delivery address (required)..." className="input pl-8 text-sm py-2" />
            </div>
          )}

          {/* Customer */}
          {customer ? (
            <div className="flex items-center justify-between px-3 py-2 bg-brand-50 rounded-xl border border-brand-200">
              <div>
                <div className="text-sm font-semibold text-brand-800">{customer.name}</div>
                <div className="text-xs text-brand-600">{customer.phone} · ⭐ {customer.loyaltyPoints} pts</div>
              </div>
              <button onClick={() => setCartCustomer(undefined)} className="text-slate-400 hover:text-red-500 p-1"><X size={14} /></button>
            </div>
          ) : (
            <button onClick={() => setShowCustomer(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600 text-sm transition">
              <UserPlus size={14} />Attach customer (optional)
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16 text-sm">
              <Receipt size={40} className="mb-3 text-slate-300" />
              <p className="font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Tap menu items to add</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map(it => (
                <div key={it.menuItemId} className="px-4 py-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <div className="text-sm font-medium text-slate-900">{it.name}</div>
                      <div className="text-xs text-slate-400">{fmtMoney(it.price)} each</div>
                    </div>
                    <div className="font-semibold text-sm text-slate-900">{fmtMoney(it.price * it.qty)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(it.menuItemId, it.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{it.qty}</span>
                      <button onClick={() => updateCartQty(it.menuItemId, it.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(it.menuItemId)} className="text-slate-300 hover:text-red-500 transition p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input value={it.notes || ''} onChange={e => setCartNotes(it.menuItemId, e.target.value)}
                    placeholder="Special instruction (e.g. less spicy)..."
                    className="mt-2 w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 focus:border-brand-300 focus:outline-none placeholder-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + actions */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-2">
            {/* Discount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-slate-600"><Tag size={13} />Discount (₹)</div>
              <input type="number" min={0} max={subtotal}
                value={cartDiscount || ''}
                onChange={e => {
                  const v = parseFloat(e.target.value) || 0;
                  if (v > subtotal) showToast(`Discount can't exceed subtotal ${fmtMoney(subtotal)}`);
                  setCartDiscount(Math.min(v, subtotal));
                }}
                placeholder="0"
                className="w-24 text-right text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-400" />
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-xl border border-slate-100 px-3 py-2 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
              {disc > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {fmtMoney(disc)}</span></div>}
              <div className="flex justify-between text-slate-500"><span>GST (5%)</span><span>+ {fmtMoney(taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100">
                <span>Total</span><span className="text-brand-600">{fmtMoney(total)}</span>
              </div>
            </div>

            {/* Items count */}
            <div className="text-xs text-slate-400 text-center">
              {cart.reduce((a, b) => a + b.qty, 0)} item(s) · {cart.length} type(s)
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => saveKOT.mutate()} disabled={saveKOT.isPending}
                className="btn-secondary text-sm py-2.5 disabled:opacity-60">
                <Save size={15} />Save KOT
              </button>
              <button onClick={handlePayNow}
                className="btn-primary text-sm py-2.5 font-semibold">
                <Receipt size={15} />Pay Now
              </button>
            </div>
            <button onClick={clearCart} className="w-full text-xs text-red-400 hover:text-red-600 py-1 transition">
              🗑 Clear cart
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showTablePicker && (
        <TablePicker
          tables={tables}
          selected={cartTableId}
          onSelect={(id: string) => setCartTable(id)}
          onClose={() => setShowTablePicker(false)}
        />
      )}

      {showCustomer && (
        <CustomerModal
          customers={customers}
          onSelect={(id: string) => setCartCustomer(id)}
          onCreate={createCustomer}
          onClose={() => setShowCustomer(false)}
        />
      )}

      {showBill && (
        <BillPreview
          cart={cart}
          subtotal={subtotal}
          discount={disc}
          taxAmount={taxAmount}
          serviceCharge={serviceCharge}
          total={total}
          paying={placeOrder.isPending}
          onPay={handleConfirmPay}
          onClose={() => setShowBill(false)}
        />
      )}

      {/* ── Order Success Modal ─────────────────────────────────────────── */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Order Placed!</h2>
            <p className="text-slate-500 text-sm mb-2">
              Order <span className="font-bold text-slate-900">#{successOrder.number}</span> confirmed
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="capitalize font-medium">{successOrder.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="uppercase font-medium">{successOrder.payment}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2 mt-2">
                <span>Total Paid</span>
                <span className="text-brand-600">{fmtMoney(successOrder.total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openPrintWindow(billHtmlRef.current)}
                className="btn-secondary py-3">
                <Printer size={16} /> Print Bill
              </button>
              <button
                onClick={() => setSuccessOrder(null)}
                className="btn-primary py-3">
                New Order →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}

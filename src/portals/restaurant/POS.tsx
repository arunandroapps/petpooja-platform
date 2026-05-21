import { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, Receipt, Save, UserPlus, Tag, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rstAPI } from '../../api/restaurant';
import { useAppStore } from '../../store/useAppStore';
import type { OrderType, PaymentMethod } from '../../types';
import { fmtMoney } from '../../utils/format';
import Modal from '../../components/Modal';

export default function RstPOS() {
  const qc = useQueryClient();
  const { cart, cartType, cartTableId, cartCustomerId, cartDiscount, addToCart, updateCartQty, removeFromCart, setCartNotes, setCartType, setCartTable, setCartCustomer, setCartDiscount, clearCart } = useAppStore();
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [showPay, setShowPay] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '' });

  const { data: cats = [] } = useQuery({ queryKey: ['rst-categories'], queryFn: rstAPI.getCategories });
  const { data: menuItems = [] } = useQuery({ queryKey: ['rst-menu'], queryFn: rstAPI.getMenuItems });
  const { data: tables = [] } = useQuery({ queryKey: ['rst-tables'], queryFn: rstAPI.getTables });
  const { data: custData } = useQuery({ queryKey: ['rst-customers-list'], queryFn: () => rstAPI.getCustomers() });
  const customers = custData?.customers || [];

  const filteredMenu = useMemo(() => menuItems.filter((m: any) =>
    (activeCat === 'all' || m.categoryId?._id === activeCat || m.categoryId === activeCat) &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase())) && m.available
  ), [menuItems, activeCat, search]);

  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const afterDiscount = Math.max(0, subtotal - cartDiscount);
  const taxAmount = Math.round(afterDiscount * 0.05);
  const total = afterDiscount + taxAmount;
  const customer = customers.find((c: any) => c._id === cartCustomerId);
  const table = tables.find((t: any) => t._id === cartTableId);

  const placeOrder = useMutation({
    mutationFn: (payment: string) => rstAPI.placeOrder({
      type: cartType, tableId: cartTableId, customerId: cartCustomerId,
      items: cart.map(l => ({ menuItemId: l.menuItemId, name: l.name, price: l.price, qty: l.qty, notes: l.notes })),
      discount: cartDiscount, payment,
    }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['rst-orders'] });
      qc.invalidateQueries({ queryKey: ['rst-tables'] });
      qc.invalidateQueries({ queryKey: ['rst-customers-list'] });
      clearCart(); setShowPay(false);
      // Print receipt
      const w = window.open('', '_blank', 'width=400,height=500');
      if (w) { w.document.write(`<html><body style="font-family:monospace;padding:16px"><h2 style="text-align:center">Bill #${order.number}</h2><hr/>${order.items.map((it: any) => `<div>${it.qty}× ${it.name} — ₹${it.qty * it.price}</div>`).join('')}<hr/><b>Total: ₹${order.total}</b><div>Payment: ${order.payment.toUpperCase()}</div><hr/><div style="text-align:center">Thank you!</div></body></html>`); w.document.close(); setTimeout(() => w.print(), 200); }
    },
  });

  const saveKOT = useMutation({
    mutationFn: () => rstAPI.placeOrder({ type: cartType, tableId: cartTableId, items: cart.map(l => ({ menuItemId: l.menuItemId, name: l.name, price: l.price, qty: l.qty, notes: l.notes })), discount: cartDiscount, payment: 'unpaid' }),
    onSuccess: (order) => { qc.invalidateQueries({ queryKey: ['rst-orders', 'rst-tables'] }); clearCart(); const w = window.open('', '_blank', 'width=400,height=400'); if (w) { w.document.write(`<html><body style="font-family:monospace;padding:16px"><h2>KOT #${order.number}</h2>${order.items.map((it: any) => `<div><b>${it.qty}×</b> ${it.name}</div>`).join('')}</body></html>`); w.document.close(); setTimeout(() => w.print(), 200); } },
  });

  const createCustomer = useMutation({
    mutationFn: () => rstAPI.createCustomer({ name: newCust.name, phone: newCust.phone }),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ['rst-customers-list'] }); setCartCustomer(c._id); setNewCust({ name: '', phone: '' }); setShowCustomer(false); },
  });

  return (
    <div className="flex h-full">
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." className="input pl-9" />
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {(['dine-in', 'takeaway', 'delivery', 'online'] as OrderType[]).map(t => (
              <button key={t} onClick={() => setCartType(t)} className={`px-3 py-1 text-xs rounded font-medium capitalize ${cartType === t ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button onClick={() => setActiveCat('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeCat === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200'}`}>All</button>
          {cats.map((c: any) => <button key={c._id} onClick={() => setActiveCat(c._id)} className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeCat === c._id ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200'}`}>{c.name}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredMenu.map((m: any) => (
            <button key={m._id} onClick={() => addToCart({ menuItemId: m._id, name: m.name, price: m.price })} className="card p-3 text-left hover:border-brand-400 hover:shadow-md transition">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center mb-2 text-2xl">🍽️</div>
              <div className="flex items-center gap-1 mb-1">
                <span className={`w-3 h-3 border ${m.veg ? 'border-emerald-500' : 'border-red-500'} flex items-center justify-center`}><span className={`w-1.5 h-1.5 rounded-full ${m.veg ? 'bg-emerald-500' : 'bg-red-500'}`} /></span>
                <div className="font-medium text-xs text-slate-800 line-clamp-1">{m.name}</div>
              </div>
              <div className="text-brand-600 font-semibold text-sm">{fmtMoney(m.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">Current Order</div>
            <span className="capitalize text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full">{cartType}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cartType === 'dine-in' && (
              <select value={cartTableId || ''} onChange={e => setCartTable(e.target.value || undefined)} className="text-xs px-2 py-1 rounded-lg bg-slate-100 border-0 flex-1">
                <option value="">Select Table</option>
                {tables.filter((t: any) => t.status !== 'cleaning').map((t: any) => <option key={t._id} value={t._id}>{t.name} ({t.seats}p)</option>)}
              </select>
            )}
            {customer
              ? <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-brand-50 text-brand-700">{customer.name}<button onClick={() => setCartCustomer(undefined)}><X size={11} /></button></div>
              : <button onClick={() => setShowCustomer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"><UserPlus size={12} />Add Customer</button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 && <div className="text-center text-slate-400 py-16 text-sm"><Receipt size={36} className="mx-auto mb-2 text-slate-300" />Cart empty</div>}
          {cart.map(it => (
            <div key={it.menuItemId} className="py-3 border-b border-slate-100">
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">{it.name}</div>
                <div className="text-sm font-semibold">{fmtMoney(it.price * it.qty)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQty(it.menuItemId, it.qty - 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Minus size={12} /></button>
                  <span className="text-sm font-bold">{it.qty}</span>
                  <button onClick={() => updateCartQty(it.menuItemId, it.qty + 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Plus size={12} /></button>
                </div>
                <button onClick={() => removeFromCart(it.menuItemId)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
              <input value={it.notes || ''} onChange={e => setCartNotes(it.menuItemId, e.target.value)} placeholder="Note..." className="mt-1 w-full text-xs px-2 py-1 rounded bg-slate-50 border-0 focus:outline-none" />
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-slate-600"><Tag size={13} />Discount</div>
              <input type="number" value={cartDiscount || ''} onChange={e => setCartDiscount(+e.target.value || 0)} placeholder="0" className="w-20 text-right text-sm bg-white px-2 py-0.5 rounded border focus:outline-none" />
            </div>
            <div className="flex justify-between text-sm text-slate-600"><span>GST (5%)</span><span>{fmtMoney(taxAmount)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{fmtMoney(total)}</span></div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => saveKOT.mutate()} disabled={saveKOT.isPending} className="btn-secondary"><Save size={14} />KOT</button>
              <button onClick={() => setShowPay(true)} className="btn-primary"><Receipt size={14} />Pay</button>
            </div>
            <button onClick={clearCart} className="w-full text-xs text-red-500 py-1">Clear cart</button>
          </div>
        )}
      </div>

      <Modal open={showPay} onClose={() => setShowPay(false)} title="Payment">
        <div className="text-3xl font-bold text-center mb-4">{fmtMoney(total)}</div>
        <div className="grid grid-cols-2 gap-3">
          {(['cash', 'card', 'upi', 'wallet'] as const).map(m => (
            <button key={m} onClick={() => placeOrder.mutate(m)} disabled={placeOrder.isPending} className="card p-5 hover:border-brand-400 hover:bg-brand-50 text-center disabled:opacity-50">
              <div className="text-3xl mb-1">{m === 'cash' ? '💵' : m === 'card' ? '💳' : m === 'upi' ? '📱' : '👛'}</div>
              <div className="text-sm font-semibold capitalize">{m}</div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showCustomer} onClose={() => setShowCustomer(false)} title="Add Customer"
        footer={<><button onClick={() => setShowCustomer(false)} className="btn-secondary">Cancel</button><button onClick={() => createCustomer.mutate()} disabled={createCustomer.isPending} className="btn-primary">Add</button></>}>
        <div className="space-y-3">
          <div className="max-h-36 overflow-y-auto space-y-1 mb-2">
            {customers.map((c: any) => (
              <button key={c._id} onClick={() => { setCartCustomer(c._id); setShowCustomer(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm flex justify-between">
                <span>{c.name}</span><span className="text-slate-500">{c.phone}</span>
              </button>
            ))}
          </div>
          <div className="border-t pt-3">
            <label className="label">Name</label><input value={newCust.name} onChange={e => setNewCust({ ...newCust, name: e.target.value })} className="input mb-2" />
            <label className="label">Phone</label><input value={newCust.phone} onChange={e => setNewCust({ ...newCust, phone: e.target.value })} className="input" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

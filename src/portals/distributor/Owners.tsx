import { useState } from 'react';
import { Plus, Store } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { distAPI } from '../../api/distributor';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { fmtDate } from '../../utils/format';

const RST_TYPES = ['Fine Dining', 'Casual Dining', 'QSR', 'Cloud Kitchen', 'Cafe', 'Bakery'];

export default function DistOwners() {
  const qc = useQueryClient();
  const { data: owners = [], isLoading } = useQuery({ queryKey: ['dist-owners'], queryFn: distAPI.getOwners });
  const { data: plans = [], isLoading: plansLoading } = useQuery({ queryKey: ['dist-plans'], queryFn: distAPI.getPlans });

  const [tab, setTab] = useState<'owners' | 'restaurants'>('owners');
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showRstModal, setShowRstModal] = useState(false);

  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', phone: '', businessName: '', city: '', state: '', gst: '', planId: '' });
  const [rstForm, setRstForm] = useState({ ownerId: '', name: '', type: 'Casual Dining', phone: '', email: '', address: '', city: '', gstin: '' });
  const [result, setResult] = useState<any>(null);

  const createOwner = useMutation({
    mutationFn: distAPI.createOwner,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dist-owners'] });
      setShowOwnerModal(false);
      setResult(data);
      setOwnerForm({ name: '', email: '', phone: '', businessName: '', city: '', state: '', gst: '', planId: '' });
    },
  });

  const createRst = useMutation({
    mutationFn: distAPI.createRestaurant,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dist-restaurants'] });
      setShowRstModal(false);
      setResult(data);
      setRstForm({ ownerId: '', name: '', type: 'Casual Dining', phone: '', email: '', address: '', city: '', gstin: '' });
    },
  });

  const submitOwner = () => {
    if (!ownerForm.name || !ownerForm.email || !ownerForm.planId) return;
    createOwner.mutate(ownerForm);
  };

  const submitRst = () => {
    if (!rstForm.ownerId || !rstForm.name || !rstForm.phone || !rstForm.address) return;
    createRst.mutate(rstForm);
  };

  return (
    <div className="p-6">
      <PageHeader
        title={tab === 'owners' ? 'My Owners' : 'Add Restaurant to Owner'}
        subtitle={tab === 'owners' ? `${(owners as any[]).length} owners in territory` : 'Create a restaurant under any of your owners'}
        actions={
          <div className="flex gap-2">
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button onClick={() => setTab('owners')} className={`px-3 py-1.5 text-xs rounded font-medium ${tab === 'owners' ? 'bg-dist-600 text-white' : 'text-slate-600'}`}>Owners</button>
              <button onClick={() => setTab('restaurants')} className={`px-3 py-1.5 text-xs rounded font-medium ${tab === 'restaurants' ? 'bg-dist-600 text-white' : 'text-slate-600'}`}>Add Restaurant</button>
            </div>
            {tab === 'owners'
              ? <button onClick={() => setShowOwnerModal(true)} className="btn-dist"><Plus size={16} />Onboard Owner</button>
              : <button onClick={() => setShowRstModal(true)} className="btn-dist"><Store size={16} />Add Restaurant</button>
            }
          </div>
        }
      />

      {/* Owners tab */}
      {tab === 'owners' && (
        <>
          {isLoading && <div className="text-center text-slate-400 py-8">Loading...</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(owners as any[]).map((o: any) => {
              const plan = o.planId;
              const daysLeft = Math.ceil((new Date(o.subscriptionEnd).getTime() - Date.now()) / 86400000);
              return (
                <div key={o._id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{o.businessName}</div>
                      <div className="text-xs text-slate-500">{o.name} · {o.city}</div>
                    </div>
                    <span className={`badge ${o.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{o.email} · {o.phone}</div>
                  <div className="flex items-center justify-between text-sm">
                    {plan && <span className="badge" style={{ background: plan.color + '20', color: plan.color }}>{plan.name}</span>}
                    <span className={`text-xs font-medium ${daysLeft < 7 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-slate-500'}`}>{daysLeft}d left</span>
                  </div>
                  {/* Quick add restaurant button */}
                  <button
                    onClick={() => { setRstForm(f => ({ ...f, ownerId: o._id, city: o.city })); setShowRstModal(true); setTab('restaurants'); }}
                    className="mt-3 w-full text-xs btn-secondary py-1.5">
                    <Store size={12} />Add Restaurant for this Owner
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Restaurant tab */}
      {tab === 'restaurants' && (
        <div className="card p-6 max-w-2xl">
          <div className="text-sm text-slate-600 mb-4">
            Select one of your owners and create a restaurant under their account.
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Owner *</label>
              <select value={rstForm.ownerId} onChange={e => setRstForm({ ...rstForm, ownerId: e.target.value })} className="input">
                <option value="">— Select Owner —</option>
                {(owners as any[]).map((o: any) => <option key={o._id} value={o._id}>{o.businessName} ({o.name})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Restaurant Name *</label><input value={rstForm.name} onChange={e => setRstForm({ ...rstForm, name: e.target.value })} className="input" /></div>
              <div><label className="label">Type</label>
                <select value={rstForm.type} onChange={e => setRstForm({ ...rstForm, type: e.target.value })} className="input">
                  {RST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="label">Phone *</label><input value={rstForm.phone} onChange={e => setRstForm({ ...rstForm, phone: e.target.value })} className="input" /></div>
              <div><label className="label">City</label><input value={rstForm.city} onChange={e => setRstForm({ ...rstForm, city: e.target.value })} className="input" /></div>
              <div className="col-span-2"><label className="label">Address *</label><input value={rstForm.address} onChange={e => setRstForm({ ...rstForm, address: e.target.value })} className="input" /></div>
              <div><label className="label">Manager Email</label><input value={rstForm.email} onChange={e => setRstForm({ ...rstForm, email: e.target.value })} className="input" placeholder="auto-generated if blank" /></div>
              <div><label className="label">GSTIN</label><input value={rstForm.gstin} onChange={e => setRstForm({ ...rstForm, gstin: e.target.value })} className="input" /></div>
            </div>
            {createRst.error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{(createRst.error as any)?.response?.data?.error || 'Failed to create restaurant'}</div>}
            <button onClick={submitRst} disabled={createRst.isPending || !rstForm.ownerId || !rstForm.name || !rstForm.phone || !rstForm.address} className="btn-dist w-full py-2.5 disabled:opacity-50">
              {createRst.isPending ? 'Creating...' : 'Create Restaurant'}
            </button>
          </div>
        </div>
      )}

      {/* Add Owner Modal */}
      <Modal open={showOwnerModal} onClose={() => setShowOwnerModal(false)} title="Onboard New Owner" size="lg"
        footer={
          <>
            <button onClick={() => setShowOwnerModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={submitOwner} disabled={createOwner.isPending || !ownerForm.name || !ownerForm.email || !ownerForm.planId} className="btn-dist disabled:opacity-50">
              {createOwner.isPending ? 'Creating...' : 'Onboard Owner'}
            </button>
          </>
        }>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Owner Name *</label><input value={ownerForm.name} onChange={e => setOwnerForm({ ...ownerForm, name: e.target.value })} className="input" /></div>
          <div><label className="label">Business Name</label><input value={ownerForm.businessName} onChange={e => setOwnerForm({ ...ownerForm, businessName: e.target.value })} className="input" /></div>
          <div><label className="label">Email *</label><input value={ownerForm.email} onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })} className="input" type="email" /></div>
          <div><label className="label">Phone</label><input value={ownerForm.phone} onChange={e => setOwnerForm({ ...ownerForm, phone: e.target.value })} className="input" type="tel" /></div>
          <div><label className="label">City</label><input value={ownerForm.city} onChange={e => setOwnerForm({ ...ownerForm, city: e.target.value })} className="input" /></div>
          <div><label className="label">State</label><input value={ownerForm.state} onChange={e => setOwnerForm({ ...ownerForm, state: e.target.value })} className="input" /></div>
          <div className="col-span-2">
            <label className="label">Subscription Plan *</label>
            {plansLoading
              ? <div className="input text-slate-400">Loading plans...</div>
              : (plans as any[]).length === 0
                ? <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded">No plans available. Contact superadmin.</div>
                : (
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(plans as any[]).map((p: any) => (
                      <button key={p._id} type="button" onClick={() => setOwnerForm({ ...ownerForm, planId: p._id })}
                        className={`p-3 rounded-xl border-2 text-left transition ${ownerForm.planId === p._id ? 'ring-2' : 'border-slate-200 hover:border-slate-300'}`}
                        style={ownerForm.planId === p._id ? { borderColor: p.color, boxShadow: `0 0 0 2px ${p.color}30` } : {}}>
                        <div className="font-semibold text-sm">{p.name}</div>
                        <div className="text-xs text-slate-500">₹{p.price}/mo</div>
                        <div className="text-[10px] text-slate-400">Max {p.maxRestaurants === 999 ? '∞' : p.maxRestaurants} branches</div>
                      </button>
                    ))}
                  </div>
                )
            }
          </div>
          <div className="col-span-2"><label className="label">GST Number</label><input value={ownerForm.gst} onChange={e => setOwnerForm({ ...ownerForm, gst: e.target.value })} className="input" /></div>
        </div>
        {createOwner.error && (
          <div className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded-lg">{(createOwner.error as any)?.response?.data?.error || 'Failed to create owner'}</div>
        )}
        <div className="mt-3 text-xs text-slate-500">Default password: <code className="bg-slate-100 px-1 rounded">owner123</code></div>
      </Modal>

      {/* Success Result Modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">✅</div>
            <h3 className="font-bold text-lg mb-2">
              {result.credentials ? (result.restaurant ? 'Restaurant Created!' : 'Owner Onboarded!') : 'Done!'}
            </h3>
            {result.credentials && (
              <div className="bg-slate-50 rounded-xl p-4 text-left text-sm mb-4 space-y-1">
                <div><span className="text-slate-500">Email:</span> <code className="font-mono">{result.credentials.email}</code></div>
                <div><span className="text-slate-500">Password:</span> <code className="font-mono">{result.credentials.password}</code></div>
              </div>
            )}
            <p className="text-xs text-slate-500 mb-4">Share these credentials with the {result.restaurant ? 'restaurant manager' : 'owner'} to log in.</p>
            <button onClick={() => setResult(null)} className="btn-dist w-full">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

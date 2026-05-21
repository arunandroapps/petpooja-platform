import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saAPI } from '../../api/superadmin';
import PageHeader from '../../components/PageHeader';
import { fmtDate } from '../../utils/format';
import { CheckCircle2, MessageSquare } from 'lucide-react';

export default function SATickets() {
  const qc = useQueryClient();
  const { data: allTickets = [] } = useQuery({ queryKey: ['sa-tickets'], queryFn: () => saAPI.getTickets() });
  const open = (allTickets as any[]).filter(t => t.status !== 'resolved');
  const resolved = (allTickets as any[]).filter(t => t.status === 'resolved');

  const update = useMutation({ mutationFn: ({ id, body }: any) => saAPI.updateTicket(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tickets'] }) });
  const resolve = useMutation({ mutationFn: (id: string) => saAPI.resolveTicket(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tickets'] }) });

  return (
    <div className="p-6">
      <PageHeader title="Support Tickets" subtitle={`${open.length} open · ${resolved.length} resolved`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-3">Open / In-Progress ({open.length})</div>
          <div className="space-y-3">
            {open.map((t: any) => (
              <div key={t._id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">{t.subject}</div>
                    <div className="text-xs text-slate-500">{t.fromName} · {t.from} · {fmtDate(new Date(t.createdAt).getTime())}</div>
                  </div>
                  <span className={`badge ${t.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                </div>
                <div className="text-sm text-slate-600 mb-3">{t.message}</div>
                <div className="flex gap-2">
                  {t.status === 'open' && <button onClick={() => update.mutate({ id: t._id, body: { status: 'in-progress' } })} className="btn-secondary text-xs">Mark In-Progress</button>}
                  <button onClick={() => resolve.mutate(t._id)} className="btn-own text-xs"><CheckCircle2 size={12} />Resolve</button>
                </div>
              </div>
            ))}
            {open.length === 0 && <div className="card p-8 text-center text-slate-400"><MessageSquare className="mx-auto mb-2" size={32} />No open tickets!</div>}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-3">Resolved ({resolved.length})</div>
          <div className="space-y-2">
            {resolved.map((t: any) => (
              <div key={t._id} className="card p-3 opacity-60">
                <div className="font-medium text-sm">{t.subject}</div>
                <div className="text-xs text-slate-500">{t.fromName} · {fmtDate(new Date(t.createdAt).getTime())}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

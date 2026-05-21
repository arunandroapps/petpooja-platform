import type { LucideIcon } from 'lucide-react';
interface Props{label:string;value:string|number;delta?:string;Icon:LucideIcon;color?:string;sub?:string}
export default function StatCard({label,value,delta,Icon,color='bg-brand-500',sub}:Props){
  return(
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          {sub&&<div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
          {delta&&<div className="mt-1 text-xs text-emerald-600 font-medium">{delta}</div>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center`}><Icon size={20}/></div>
      </div>
    </div>
  );
}

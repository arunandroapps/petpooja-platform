export const fmtMoney=(n:number,s='₹')=>`${s}${n.toLocaleString('en-IN',{maximumFractionDigits:2})}`;
export const fmtDate=(ts:number)=>new Date(ts).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
export const fmtDay=(ts:number)=>new Date(ts).toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
export const fmtTime=(ts:number)=>new Date(ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
export const ago=(ts:number)=>{const s=Math.floor((Date.now()-ts)/1000);if(s<60)return`${s}s ago`;const m=Math.floor(s/60);if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`;};
export const startOfDay=(ts:number)=>{const d=new Date(ts);d.setHours(0,0,0,0);return d.getTime();};

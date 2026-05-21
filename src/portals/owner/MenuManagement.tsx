import { usePlatform } from '../../store/usePlatform';
import PageHeader from '../../components/PageHeader';
import { fmtMoney } from '../../utils/format';

export default function OwnMenu() {
  const { currentUser, owners, restaurants, menu, categories } = usePlatform();
  const owner = owners.find(o=>o.id===currentUser?.entityId);
  const myRstIds = restaurants.filter(r=>r.ownerId===owner?.id).map(r=>r.id);
  const myMenu = menu.filter(m=>myRstIds.includes(m.restaurantId));
  const myCats = categories.filter(c=>myRstIds.includes(c.restaurantId));
  return (
    <div className="p-6">
      <PageHeader title="Menu Overview" subtitle={`${myMenu.length} items across all branches`}/>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">Item</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Branch</th><th className="text-right px-4 py-3">Price</th><th className="text-center px-4 py-3">Available</th></tr></thead>
          <tbody>
            {myMenu.map(m=>{
              const cat=myCats.find(c=>c.id===m.categoryId);
              const rst=restaurants.find(r=>r.id===m.restaurantId);
              return(<tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-medium">{m.name}</div><span className={`badge text-[10px] ${m.veg?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{m.veg?'Veg':'Non-veg'}</span></td>
                <td className="px-4 py-3 text-slate-600">{cat?.name||'—'}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{rst?.name}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmtMoney(m.price)}</td>
                <td className="px-4 py-3 text-center"><span className={`badge ${m.available?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{m.available?'Yes':'No'}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

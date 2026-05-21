import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AuthUser, Plan, Distributor, Owner, Restaurant,
  Category, MenuItem, Table, Customer, Order, OrderItem,
  IngredientStock, Staff, PlatformSettings, Ticket,
  ID, Status, TableStatus, OrderStatus, PaymentMethod, OrderType,
} from '../types';
import {
  seedUsers, seedPlans, seedDistributors, seedOwners, seedRestaurants,
  seedCategories, seedMenu, seedTables, seedCustomers, seedOrders,
  seedIngredients, seedStaff, seedTickets, seedPlatformSettings,
} from '../data/seed';

const uid = () => Math.random().toString(36).slice(2, 10);

interface CartLine { id:ID; menuItemId:ID; qty:number; notes?:string }

interface State {
  // Auth
  currentUser: AuthUser | null;
  users: AuthUser[];

  // Platform entities
  plans: Plan[];
  distributors: Distributor[];
  owners: Owner[];
  restaurants: Restaurant[];

  // Restaurant operations
  categories: Category[];
  menu: MenuItem[];
  tables: Table[];
  customers: Customer[];
  orders: Order[];
  ingredients: IngredientStock[];
  staff: Staff[];
  tickets: Ticket[];
  platformSettings: PlatformSettings;

  // POS Session
  activeRestaurantId: ID | null;
  cart: CartLine[];
  cartType: OrderType;
  cartTableId?: ID;
  cartCustomerId?: ID;
  cartDiscount: number;
  orderCounter: number;

  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;

  // ── Platform: Plans ───────────────────────────────────────────────────────
  upsertPlan: (p: Plan) => void;
  deletePlan: (id: ID) => void;

  // ── Platform: Distributors ────────────────────────────────────────────────
  upsertDistributor: (d: Distributor) => void;
  updateDistributorStatus: (id: ID, status: Status) => void;

  // ── Platform: Owners ─────────────────────────────────────────────────────
  upsertOwner: (o: Owner) => void;
  updateOwnerStatus: (id: ID, status: Status) => void;

  // ── Platform: Restaurants ─────────────────────────────────────────────────
  upsertRestaurant: (r: Restaurant) => void;
  updateRestaurantStatus: (id: ID, status: Status) => void;

  // ── Tickets ───────────────────────────────────────────────────────────────
  upsertTicket: (t: Ticket) => void;
  resolveTicket: (id: ID) => void;

  // ── POS / Cart ────────────────────────────────────────────────────────────
  setActiveRestaurant: (id: ID) => void;
  addToCart: (menuItemId: ID, qty?: number) => void;
  updateCartQty: (lineId: ID, qty: number) => void;
  removeFromCart: (lineId: ID) => void;
  setCartNotes: (lineId: ID, notes: string) => void;
  setCartType: (t: OrderType) => void;
  setCartTable: (id?: ID) => void;
  setCartCustomer: (id?: ID) => void;
  setCartDiscount: (d: number) => void;
  clearCart: () => void;
  placeOrder: (payment: PaymentMethod) => Order | null;
  saveAsKOT: () => Order | null;

  // ── Orders ────────────────────────────────────────────────────────────────
  updateOrderStatus: (id: ID, s: OrderStatus) => void;
  updateOrderItemStatus: (orderId: ID, itemId: ID, s: NonNullable<OrderItem['status']>) => void;
  payOrder: (id: ID, method: PaymentMethod) => void;
  cancelOrder: (id: ID) => void;

  // ── Tables ────────────────────────────────────────────────────────────────
  setTableStatus: (id: ID, s: TableStatus) => void;
  upsertTable: (t: Table) => void;
  deleteTable: (id: ID) => void;

  // ── Menu ─────────────────────────────────────────────────────────────────
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: ID) => void;
  upsertMenuItem: (m: MenuItem) => void;
  deleteMenuItem: (id: ID) => void;
  toggleAvailability: (id: ID) => void;

  // ── Customers ────────────────────────────────────────────────────────────
  upsertCustomer: (c: Customer) => Customer;

  // ── Inventory ────────────────────────────────────────────────────────────
  upsertIngredient: (i: IngredientStock) => void;
  adjustStock: (id: ID, delta: number) => void;
  deleteIngredient: (id: ID) => void;

  // ── Staff ────────────────────────────────────────────────────────────────
  upsertStaff: (s: Staff) => void;
  deleteStaff: (id: ID) => void;

  // ── Settings ─────────────────────────────────────────────────────────────
  updatePlatformSettings: (p: Partial<PlatformSettings>) => void;

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetAll: () => void;
}

const initOrders = seedOrders();
const initCounter = (initOrders[initOrders.length-1]?.number || 1000) + 1;

export const usePlatform = create<State>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: seedUsers,
      plans: seedPlans,
      distributors: seedDistributors,
      owners: seedOwners,
      restaurants: seedRestaurants,
      categories: seedCategories,
      menu: seedMenu,
      tables: seedTables,
      customers: seedCustomers,
      orders: initOrders,
      ingredients: seedIngredients,
      staff: seedStaff,
      tickets: seedTickets,
      platformSettings: seedPlatformSettings,
      activeRestaurantId: 'rst-1',
      cart: [],
      cartType: 'dine-in',
      cartTableId: undefined,
      cartCustomerId: undefined,
      cartDiscount: 0,
      orderCounter: initCounter,

      // Auth
      login: (email, password) => {
        const u = get().users.find(u => u.email === email && u.password === password);
        if (u) {
          set({ currentUser: u, activeRestaurantId: u.role === 'restaurant' ? u.entityId : (u.role === 'owner' ? get().restaurants.find(r=>r.ownerId===u.entityId)?.id || null : null) });
        }
        return u || null;
      },
      logout: () => set({ currentUser: null, cart: [], cartTableId: undefined }),

      // Plans
      upsertPlan: (p) => set(s => ({ plans: s.plans.find(x=>x.id===p.id) ? s.plans.map(x=>x.id===p.id?p:x) : [...s.plans,p] })),
      deletePlan: (id) => set(s => ({ plans: s.plans.filter(p=>p.id!==id) })),

      // Distributors
      upsertDistributor: (d) => {
        const arr = get().distributors;
        const exists = arr.find(x=>x.id===d.id);
        if (!exists) {
          const authUser: AuthUser = { id:uid(), email:d.email, password:'dist123', role:'distributor', entityId:d.id, name:d.name };
          set(s=>({ distributors:[...s.distributors,d], users:[...s.users,authUser] }));
        } else {
          set(s=>({ distributors:s.distributors.map(x=>x.id===d.id?d:x) }));
        }
      },
      updateDistributorStatus: (id,status) => set(s=>({ distributors:s.distributors.map(d=>d.id===id?{...d,status}:d) })),

      // Owners
      upsertOwner: (o) => {
        const arr = get().owners;
        const exists = arr.find(x=>x.id===o.id);
        if (!exists) {
          const authUser: AuthUser = { id:uid(), email:o.email, password:'owner123', role:'owner', entityId:o.id, name:o.name };
          set(s=>({ owners:[...s.owners,o], users:[...s.users,authUser] }));
        } else {
          set(s=>({ owners:s.owners.map(x=>x.id===o.id?o:x) }));
        }
      },
      updateOwnerStatus: (id,status) => set(s=>({ owners:s.owners.map(o=>o.id===id?{...o,status}:o) })),

      // Restaurants
      upsertRestaurant: (r) => {
        const arr = get().restaurants;
        const exists = arr.find(x=>x.id===r.id);
        if (!exists) {
          const owner = get().owners.find(o=>o.id===r.ownerId);
          const authUser: AuthUser = { id:uid(), email:r.email||`manager@${r.id}.petpooja.com`, password:'rest123', role:'restaurant', entityId:r.id, name:`${r.name} Manager` };
          set(s=>({ restaurants:[...s.restaurants,r], users:[...s.users,authUser], owners:s.owners.map(o=>o.id===r.ownerId?{...o,totalRestaurants:o.totalRestaurants+1}:o) }));
        } else {
          set(s=>({ restaurants:s.restaurants.map(x=>x.id===r.id?r:x) }));
        }
      },
      updateRestaurantStatus: (id,status) => set(s=>({ restaurants:s.restaurants.map(r=>r.id===id?{...r,status}:r) })),

      // Tickets
      upsertTicket: (t) => set(s=>({ tickets:s.tickets.find(x=>x.id===t.id)?s.tickets.map(x=>x.id===t.id?t:x):[t,...s.tickets] })),
      resolveTicket: (id) => set(s=>({ tickets:s.tickets.map(t=>t.id===id?{...t,status:'resolved' as const}:t) })),

      // POS
      setActiveRestaurant: (id) => set({ activeRestaurantId:id, cart:[], cartTableId:undefined }),
      addToCart: (menuItemId, qty=1) => {
        const cart=[...get().cart];
        const idx=cart.findIndex(l=>l.menuItemId===menuItemId);
        if(idx>=0) cart[idx]={...cart[idx],qty:cart[idx].qty+qty};
        else cart.push({id:uid(),menuItemId,qty});
        set({cart});
      },
      updateCartQty:(lineId,qty)=>set({cart:get().cart.map(l=>l.id===lineId?{...l,qty:Math.max(1,qty)}:l).filter(l=>l.qty>0)}),
      removeFromCart:(lineId)=>set({cart:get().cart.filter(l=>l.id!==lineId)}),
      setCartNotes:(lineId,notes)=>set({cart:get().cart.map(l=>l.id===lineId?{...l,notes}:l)}),
      setCartType:(t)=>set({cartType:t}),
      setCartTable:(id)=>set({cartTableId:id}),
      setCartCustomer:(id)=>set({cartCustomerId:id}),
      setCartDiscount:(d)=>set({cartDiscount:Math.max(0,d)}),
      clearCart:()=>set({cart:[],cartTableId:undefined,cartCustomerId:undefined,cartDiscount:0}),

      placeOrder:(payment)=>{
        const s=get();
        if(!s.cart.length||!s.activeRestaurantId) return null;
        const items: OrderItem[]=s.cart.map(l=>{
          const m=s.menu.find(x=>x.id===l.menuItemId)!;
          return {id:l.id,menuItemId:m.id,name:m.name,price:m.price,qty:l.qty,notes:l.notes,status:'served'};
        });
        const sub=items.reduce((a,b)=>a+b.price*b.qty,0);
        const disc=Math.max(0,sub-s.cartDiscount);
        const tax=Math.round(disc*0.05);
        const total=disc+tax;
        const order:Order={
          id:uid(),restaurantId:s.activeRestaurantId,number:s.orderCounter,
          type:s.cartType,tableId:s.cartTableId,customerId:s.cartCustomerId,
          items,status:'completed',payment,
          subtotal:sub,discount:s.cartDiscount,taxAmount:tax,total,
          createdAt:Date.now(),updatedAt:Date.now(),
        };
        const tables=s.tables.map(t=>t.id===s.cartTableId?{...t,status:'free' as TableStatus,currentOrderId:undefined}:t);
        let customers=s.customers;
        if(s.cartCustomerId){
          customers=customers.map(c=>c.id===s.cartCustomerId?{...c,visits:c.visits+1,totalSpent:c.totalSpent+total,loyaltyPoints:c.loyaltyPoints+Math.floor(total*2/100),lastVisit:Date.now()}:c);
        }
        const restaurants=s.restaurants.map(r=>r.id===s.activeRestaurantId?{...r,totalOrders:r.totalOrders+1,totalRevenue:r.totalRevenue+total}:r);
        set({orders:[order,...s.orders],orderCounter:s.orderCounter+1,tables,customers,restaurants,cart:[],cartTableId:undefined,cartCustomerId:undefined,cartDiscount:0});
        return order;
      },

      saveAsKOT:()=>{
        const s=get();
        if(!s.cart.length||!s.activeRestaurantId) return null;
        const items:OrderItem[]=s.cart.map(l=>{
          const m=s.menu.find(x=>x.id===l.menuItemId)!;
          return {id:l.id,menuItemId:m.id,name:m.name,price:m.price,qty:l.qty,notes:l.notes,status:'new'};
        });
        const sub=items.reduce((a,b)=>a+b.price*b.qty,0);
        const tax=Math.round(sub*0.05);
        const order:Order={id:uid(),restaurantId:s.activeRestaurantId,number:s.orderCounter,type:s.cartType,tableId:s.cartTableId,items,status:'preparing',payment:'unpaid',subtotal:sub,discount:0,taxAmount:tax,total:sub+tax,createdAt:Date.now(),updatedAt:Date.now()};
        const tables=s.tables.map(t=>t.id===s.cartTableId?{...t,status:'occupied' as TableStatus,currentOrderId:order.id}:t);
        set({orders:[order,...s.orders],orderCounter:s.orderCounter+1,tables,cart:[],cartTableId:undefined,cartCustomerId:undefined,cartDiscount:0});
        return order;
      },

      updateOrderStatus:(id,status)=>set(s=>({orders:s.orders.map(o=>o.id===id?{...o,status,updatedAt:Date.now()}:o)})),
      updateOrderItemStatus:(orderId,itemId,status)=>set(s=>({orders:s.orders.map(o=>o.id===orderId?{...o,items:o.items.map(it=>it.id===itemId?{...it,status}:it)}:o)})),
      payOrder:(id,method)=>{
        const s=get();
        const tables=s.tables.map(t=>t.currentOrderId===id?{...t,status:'cleaning' as TableStatus,currentOrderId:undefined}:t);
        set({orders:s.orders.map(o=>o.id===id?{...o,payment:method,status:'completed',updatedAt:Date.now()}:o),tables});
      },
      cancelOrder:(id)=>{
        const s=get();
        const tables=s.tables.map(t=>t.currentOrderId===id?{...t,status:'free' as TableStatus,currentOrderId:undefined}:t);
        set({orders:s.orders.map(o=>o.id===id?{...o,status:'cancelled',updatedAt:Date.now()}:o),tables});
      },

      setTableStatus:(id,status)=>set(s=>({tables:s.tables.map(t=>t.id===id?{...t,status}:t)})),
      upsertTable:(t)=>set(s=>({tables:s.tables.find(x=>x.id===t.id)?s.tables.map(x=>x.id===t.id?t:x):[...s.tables,t]})),
      deleteTable:(id)=>set(s=>({tables:s.tables.filter(t=>t.id!==id)})),

      upsertCategory:(c)=>set(s=>({categories:s.categories.find(x=>x.id===c.id)?s.categories.map(x=>x.id===c.id?c:x):[...s.categories,c]})),
      deleteCategory:(id)=>set(s=>({categories:s.categories.filter(c=>c.id!==id),menu:s.menu.filter(m=>m.categoryId!==id)})),
      upsertMenuItem:(m)=>set(s=>({menu:s.menu.find(x=>x.id===m.id)?s.menu.map(x=>x.id===m.id?m:x):[...s.menu,m]})),
      deleteMenuItem:(id)=>set(s=>({menu:s.menu.filter(m=>m.id!==id)})),
      toggleAvailability:(id)=>set(s=>({menu:s.menu.map(m=>m.id===id?{...m,available:!m.available}:m)})),

      upsertCustomer:(c)=>{
        set(s=>({customers:s.customers.find(x=>x.id===c.id)?s.customers.map(x=>x.id===c.id?c:x):[...s.customers,c]}));
        return c;
      },

      upsertIngredient:(i)=>set(s=>({ingredients:s.ingredients.find(x=>x.id===i.id)?s.ingredients.map(x=>x.id===i.id?i:x):[...s.ingredients,i]})),
      adjustStock:(id,delta)=>set(s=>({ingredients:s.ingredients.map(i=>i.id===id?{...i,stock:Math.max(0,i.stock+delta),lastUpdated:Date.now()}:i)})),
      deleteIngredient:(id)=>set(s=>({ingredients:s.ingredients.filter(i=>i.id!==id)})),

      upsertStaff:(st)=>set(s=>({staff:s.staff.find(x=>x.id===st.id)?s.staff.map(x=>x.id===st.id?st:x):[...s.staff,st]})),
      deleteStaff:(id)=>set(s=>({staff:s.staff.filter(x=>x.id!==id)})),

      updatePlatformSettings:(p)=>set(s=>({platformSettings:{...s.platformSettings,...p}})),

      resetAll:()=>{
        const orders=seedOrders();
        set({plans:seedPlans,distributors:seedDistributors,owners:seedOwners,restaurants:seedRestaurants,categories:seedCategories,menu:seedMenu,tables:seedTables,customers:seedCustomers,orders,ingredients:seedIngredients,staff:seedStaff,tickets:seedTickets,platformSettings:seedPlatformSettings,users:seedUsers,cart:[],orderCounter:(orders[orders.length-1]?.number||1000)+1});
      },
    }),
    { name:'petpooja-platform-v1' }
  )
);

export const newId = uid;

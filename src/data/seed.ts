import type {
  AuthUser, Plan, Distributor, Owner, Restaurant,
  Category, MenuItem, Table, Customer, Order, OrderItem,
  IngredientStock, Staff, PlatformSettings, Ticket
} from '../types';

const uid = () => Math.random().toString(36).slice(2,10);

// ─── Plans ───────────────────────────────────────────────────────────────────
export const seedPlans: Plan[] = [
  { id:'plan-basic', name:'Basic', tier:'basic', price:999, yearlyPrice:9990, maxRestaurants:1, maxStaff:5, color:'#6b7280', features:['POS & Billing','KOT','Menu Management','Basic Reports','Email Support'] },
  { id:'plan-pro', name:'Pro', tier:'pro', price:2499, yearlyPrice:24990, maxRestaurants:5, maxStaff:25, color:'#f97316', features:['Everything in Basic','Multi-branch','Inventory','CRM & Loyalty','Advanced Analytics','Priority Support'] },
  { id:'plan-enterprise', name:'Enterprise', tier:'enterprise', price:5999, yearlyPrice:59990, maxRestaurants:999, maxStaff:999, color:'#8b5cf6', features:['Everything in Pro','Unlimited branches','KDS','API Access','Custom Integrations','Dedicated Manager'] },
];

// ─── Distributors ─────────────────────────────────────────────────────────────
export const seedDistributors: Distributor[] = [
  { id:'dist-1', name:'North India Partners', email:'north@petpooja.com', phone:'9100001111', region:'North India', state:'Delhi', commissionPct:10, status:'active', joinedAt:Date.now()-180*86400000, totalOwners:12, totalRestaurants:38, totalRevenue:4820000, commissionEarned:482000 },
  { id:'dist-2', name:'West Zone Foods', email:'west@petpooja.com', phone:'9100002222', region:'West India', state:'Maharashtra', commissionPct:12, status:'active', joinedAt:Date.now()-220*86400000, totalOwners:18, totalRestaurants:62, totalRevenue:7340000, commissionEarned:880800 },
  { id:'dist-3', name:'South Distribution Co.', email:'south@petpooja.com', phone:'9100003333', region:'South India', state:'Karnataka', commissionPct:10, status:'active', joinedAt:Date.now()-150*86400000, totalOwners:9, totalRestaurants:24, totalRevenue:2910000, commissionEarned:291000 },
  { id:'dist-4', name:'East Connect Pvt. Ltd.', email:'east@petpooja.com', phone:'9100004444', region:'East India', state:'West Bengal', commissionPct:8, status:'pending', joinedAt:Date.now()-30*86400000, totalOwners:2, totalRestaurants:3, totalRevenue:210000, commissionEarned:16800 },
];

// ─── Owners ───────────────────────────────────────────────────────────────────
export const seedOwners: Owner[] = [
  { id:'own-1', distributorId:'dist-2', planId:'plan-enterprise', name:'Rajesh Khanna', email:'rajesh@spiceroute.com', phone:'9200001111', businessName:'Spice Route Hospitality', gst:'27AAAAA0000A1Z5', city:'Mumbai', state:'Maharashtra', status:'active', joinedAt:Date.now()-365*86400000, subscriptionStart:Date.now()-30*86400000, subscriptionEnd:Date.now()+335*86400000, totalRestaurants:4, totalRevenue:8240000 },
  { id:'own-2', distributorId:'dist-1', planId:'plan-pro', name:'Priya Sharma', email:'priya@delhibites.com', phone:'9200002222', businessName:'Delhi Bites Pvt. Ltd.', city:'New Delhi', state:'Delhi', status:'active', joinedAt:Date.now()-180*86400000, subscriptionStart:Date.now()-15*86400000, subscriptionEnd:Date.now()+350*86400000, totalRestaurants:2, totalRevenue:1820000 },
  { id:'own-3', distributorId:'dist-3', planId:'plan-pro', name:'Suresh Nair', email:'suresh@southspice.com', phone:'9200003333', businessName:'South Spice Group', city:'Bangalore', state:'Karnataka', status:'active', joinedAt:Date.now()-90*86400000, subscriptionStart:Date.now()-10*86400000, subscriptionEnd:Date.now()+355*86400000, totalRestaurants:3, totalRevenue:2350000 },
  { id:'own-4', distributorId:'dist-1', planId:'plan-basic', name:'Anil Verma', email:'anil@quickbites.com', phone:'9200004444', businessName:'Quick Bites', city:'Noida', state:'UP', status:'pending', joinedAt:Date.now()-5*86400000, subscriptionStart:Date.now(), subscriptionEnd:Date.now()+30*86400000, totalRestaurants:1, totalRevenue:0 },
];

// ─── Restaurants ──────────────────────────────────────────────────────────────
export const seedRestaurants: Restaurant[] = [
  { id:'rst-1', ownerId:'own-1', name:'Spice Route — Bandra', type:'Fine Dining', phone:'022-40001111', address:'SV Road, Bandra West', city:'Mumbai', gstin:'27AAAAA0000A1Z5', status:'active', createdAt:Date.now()-360*86400000, totalTables:20, totalOrders:4820, totalRevenue:3840000 },
  { id:'rst-2', ownerId:'own-1', name:'Spice Route — Andheri', type:'Fine Dining', phone:'022-40002222', address:'Link Road, Andheri West', city:'Mumbai', status:'active', createdAt:Date.now()-300*86400000, totalTables:16, totalOrders:3610, totalRevenue:2840000 },
  { id:'rst-3', ownerId:'own-1', name:'SR Cloud Kitchen', type:'Cloud Kitchen', phone:'022-40003333', address:'Malad Industrial Estate', city:'Mumbai', status:'active', createdAt:Date.now()-180*86400000, totalTables:0, totalOrders:2140, totalRevenue:1120000 },
  { id:'rst-4', ownerId:'own-1', name:'Spice Route Express', type:'QSR', phone:'022-40004444', address:'Phoenix Mall, Lower Parel', city:'Mumbai', status:'inactive', createdAt:Date.now()-100*86400000, totalTables:8, totalOrders:820, totalRevenue:440000 },
  { id:'rst-5', ownerId:'own-2', name:'Delhi Bites — CP', type:'Casual Dining', phone:'011-40005555', address:'Connaught Place, Block B', city:'New Delhi', status:'active', createdAt:Date.now()-170*86400000, totalTables:12, totalOrders:3200, totalRevenue:1280000 },
  { id:'rst-6', ownerId:'own-2', name:'Delhi Bites — Saket', type:'Casual Dining', phone:'011-40006666', address:'Select Citywalk, Saket', city:'New Delhi', status:'active', createdAt:Date.now()-120*86400000, totalTables:10, totalOrders:1800, totalRevenue:540000 },
  { id:'rst-7', ownerId:'own-3', name:'South Spice — Koramangala', type:'Fine Dining', phone:'080-40007777', address:'5th Block, Koramangala', city:'Bangalore', status:'active', createdAt:Date.now()-85*86400000, totalTables:15, totalOrders:1620, totalRevenue:980000 },
  { id:'rst-8', ownerId:'own-3', name:'South Spice — Indiranagar', type:'Casual Dining', phone:'080-40008888', address:'100 Feet Road, Indiranagar', city:'Bangalore', status:'active', createdAt:Date.now()-60*86400000, totalTables:10, totalOrders:1100, totalRevenue:880000 },
  { id:'rst-9', ownerId:'own-3', name:'South Spice Cafe', type:'Cafe', phone:'080-40009999', address:'MG Road, Bangalore', city:'Bangalore', status:'pending', createdAt:Date.now()-10*86400000, totalTables:6, totalOrders:0, totalRevenue:0 },
  { id:'rst-10', ownerId:'own-4', name:'Quick Bites — Noida', type:'QSR', phone:'0120-4000000', address:'Sector 18 Market, Noida', city:'Noida', status:'pending', createdAt:Date.now()-3*86400000, totalTables:4, totalOrders:0, totalRevenue:0 },
];

// ─── Categories (for rst-1) ───────────────────────────────────────────────────
export const seedCategories: Category[] = [
  { id:'cat-1', restaurantId:'rst-1', name:'Starters', color:'#fb923c' },
  { id:'cat-2', restaurantId:'rst-1', name:'Main Course', color:'#f97316' },
  { id:'cat-3', restaurantId:'rst-1', name:'Breads', color:'#fbbf24' },
  { id:'cat-4', restaurantId:'rst-1', name:'Rice & Biryani', color:'#facc15' },
  { id:'cat-5', restaurantId:'rst-1', name:'Beverages', color:'#06b6d4' },
  { id:'cat-6', restaurantId:'rst-1', name:'Desserts', color:'#ec4899' },
];

export const seedMenu: MenuItem[] = [
  { id:'mi-1', restaurantId:'rst-1', categoryId:'cat-1', name:'Paneer Tikka', price:280, tax:5, veg:true, available:true, description:'Marinated cottage cheese grilled in tandoor' },
  { id:'mi-2', restaurantId:'rst-1', categoryId:'cat-1', name:'Chicken Wings', price:320, tax:5, veg:false, available:true },
  { id:'mi-3', restaurantId:'rst-1', categoryId:'cat-1', name:'Veg Spring Roll', price:180, tax:5, veg:true, available:true },
  { id:'mi-4', restaurantId:'rst-1', categoryId:'cat-2', name:'Paneer Butter Masala', price:320, tax:5, veg:true, available:true },
  { id:'mi-5', restaurantId:'rst-1', categoryId:'cat-2', name:'Butter Chicken', price:380, tax:5, veg:false, available:true },
  { id:'mi-6', restaurantId:'rst-1', categoryId:'cat-2', name:'Dal Makhani', price:240, tax:5, veg:true, available:true },
  { id:'mi-7', restaurantId:'rst-1', categoryId:'cat-2', name:'Mutton Rogan Josh', price:460, tax:5, veg:false, available:true },
  { id:'mi-8', restaurantId:'rst-1', categoryId:'cat-3', name:'Butter Naan', price:50, tax:5, veg:true, available:true },
  { id:'mi-9', restaurantId:'rst-1', categoryId:'cat-3', name:'Garlic Naan', price:70, tax:5, veg:true, available:true },
  { id:'mi-10', restaurantId:'rst-1', categoryId:'cat-4', name:'Chicken Biryani', price:320, tax:5, veg:false, available:true },
  { id:'mi-11', restaurantId:'rst-1', categoryId:'cat-4', name:'Veg Biryani', price:260, tax:5, veg:true, available:true },
  { id:'mi-12', restaurantId:'rst-1', categoryId:'cat-5', name:'Masala Chai', price:40, tax:5, veg:true, available:true },
  { id:'mi-13', restaurantId:'rst-1', categoryId:'cat-5', name:'Cold Coffee', price:140, tax:5, veg:true, available:true },
  { id:'mi-14', restaurantId:'rst-1', categoryId:'cat-6', name:'Gulab Jamun', price:90, tax:5, veg:true, available:true },
  { id:'mi-15', restaurantId:'rst-1', categoryId:'cat-6', name:'Choco Lava Cake', price:180, tax:5, veg:true, available:true },
];

export const seedTables: Table[] = [
  { id:'tbl-1', restaurantId:'rst-1', name:'T1', area:'Indoor', seats:2, status:'free' },
  { id:'tbl-2', restaurantId:'rst-1', name:'T2', area:'Indoor', seats:2, status:'occupied' },
  { id:'tbl-3', restaurantId:'rst-1', name:'T3', area:'Indoor', seats:4, status:'free' },
  { id:'tbl-4', restaurantId:'rst-1', name:'T4', area:'Indoor', seats:4, status:'reserved' },
  { id:'tbl-5', restaurantId:'rst-1', name:'T5', area:'Indoor', seats:6, status:'free' },
  { id:'tbl-6', restaurantId:'rst-1', name:'T6', area:'Outdoor', seats:4, status:'free' },
  { id:'tbl-7', restaurantId:'rst-1', name:'T7', area:'Outdoor', seats:4, status:'cleaning' },
  { id:'tbl-8', restaurantId:'rst-1', name:'T8', area:'Private', seats:10, status:'free' },
];

export const seedCustomers: Customer[] = [
  { id:'cust-1', restaurantId:'rst-1', name:'Arjun Mehta', phone:'9876500001', loyaltyPoints:240, visits:14, totalSpent:18400, lastVisit:Date.now()-2*86400000 },
  { id:'cust-2', restaurantId:'rst-1', name:'Kavitha Reddy', phone:'9876500002', loyaltyPoints:80, visits:5, totalSpent:6200, lastVisit:Date.now()-7*86400000 },
  { id:'cust-3', restaurantId:'rst-1', name:'Farhan Sheikh', phone:'9876500003', loyaltyPoints:540, visits:30, totalSpent:41000, lastVisit:Date.now()-1*86400000 },
];

export const seedIngredients: IngredientStock[] = [
  { id:'ing-1', restaurantId:'rst-1', name:'Paneer', unit:'kg', stock:8, minStock:5, costPerUnit:320, lastUpdated:Date.now() },
  { id:'ing-2', restaurantId:'rst-1', name:'Chicken', unit:'kg', stock:12, minStock:6, costPerUnit:240, lastUpdated:Date.now() },
  { id:'ing-3', restaurantId:'rst-1', name:'Basmati Rice', unit:'kg', stock:25, minStock:10, costPerUnit:110, lastUpdated:Date.now() },
  { id:'ing-4', restaurantId:'rst-1', name:'Tomato', unit:'kg', stock:4, minStock:8, costPerUnit:40, lastUpdated:Date.now() },
  { id:'ing-5', restaurantId:'rst-1', name:'Butter', unit:'kg', stock:3, minStock:4, costPerUnit:480, lastUpdated:Date.now() },
  { id:'ing-6', restaurantId:'rst-1', name:'Cooking Oil', unit:'L', stock:22, minStock:10, costPerUnit:140, lastUpdated:Date.now() },
];

export const seedStaff: Staff[] = [
  { id:'staff-1', restaurantId:'rst-1', name:'Vikram Joshi', role:'manager', phone:'9300001111', pin:'1234', active:true },
  { id:'staff-2', restaurantId:'rst-1', name:'Sunita Patel', role:'cashier', phone:'9300002222', pin:'2345', active:true },
  { id:'staff-3', restaurantId:'rst-1', name:'Ravi Kumar', role:'waiter', phone:'9300003333', pin:'3456', active:true },
  { id:'staff-4', restaurantId:'rst-1', name:'Anita Singh', role:'chef', phone:'9300004444', pin:'4567', active:true },
];

const makeOrders = (): Order[] => {
  const items: MenuItem[] = seedMenu;
  const out: Order[] = [];
  let n = 1001;
  const now = Date.now();
  for (let d = 6; d >= 0; d--) {
    const cnt = 5 + Math.floor(Math.random() * 8);
    for (let i = 0; i < cnt; i++) {
      const lineCount = 1 + Math.floor(Math.random() * 3);
      const orderItems: OrderItem[] = [];
      let sub = 0;
      for (let j = 0; j < lineCount; j++) {
        const m = items[Math.floor(Math.random() * items.length)];
        const qty = 1 + Math.floor(Math.random() * 2);
        orderItems.push({ id:uid(), menuItemId:m.id, name:m.name, price:m.price, qty, status:'served' });
        sub += m.price * qty;
      }
      const tax = Math.round(sub * 0.05);
      const types: Order['type'][] = ['dine-in','takeaway','delivery','online'];
      const pays: Order['payment'][] = ['cash','card','upi','wallet'];
      out.push({
        id: uid(), restaurantId:'rst-1', number:n++,
        type: types[Math.floor(Math.random()*types.length)],
        items: orderItems, status:'completed',
        payment: pays[Math.floor(Math.random()*pays.length)],
        subtotal:sub, discount:0, taxAmount:tax, total:sub+tax,
        createdAt: now - d*86400000 - Math.floor(Math.random()*86400000),
        updatedAt: now - d*86400000,
      });
    }
  }
  return out;
};

export const seedOrders = makeOrders;

export const seedTickets: Ticket[] = [
  { id:'tkt-1', from:'restaurant', fromName:'Spice Route Bandra', subject:'Printer not connecting', message:'KOT printer is not connecting after update.', status:'open', createdAt:Date.now()-2*86400000 },
  { id:'tkt-2', from:'owner', fromName:'Rajesh Khanna', subject:'Need to upgrade plan', message:'Want to add 2 more branches under Enterprise.', status:'in-progress', createdAt:Date.now()-86400000 },
  { id:'tkt-3', from:'distributor', fromName:'West Zone Foods', subject:'Commission payout query', message:'March commission not received.', status:'open', createdAt:Date.now()-3*86400000 },
];

export const seedPlatformSettings: PlatformSettings = {
  name: 'Pet Pooja Platform',
  currency: '₹',
  supportEmail: 'support@petpooja.com',
  defaultTax: 5,
  trialDays: 14,
};

// ─── Auth Users ───────────────────────────────────────────────────────────────
// NOTE: This frontend seed is for DEMO / localStorage mode only.
// Production auth is handled by the backend API (petpooja-api).
// Demo credentials are documented in README.md — do NOT store real credentials here.
export const seedUsers: AuthUser[] = [
  { id:'user-sa', email:'admin@petpooja.com', password:'demo_sa', role:'superadmin', entityId:'superadmin', name:'Super Admin' },
  { id:'user-d1', email:'north@petpooja.com', password:'demo_dist', role:'distributor', entityId:'dist-1', name:'North India Partners' },
  { id:'user-d2', email:'west@petpooja.com', password:'demo_dist', role:'distributor', entityId:'dist-2', name:'West Zone Foods' },
  { id:'user-o1', email:'rajesh@spiceroute.com', password:'demo_owner', role:'owner', entityId:'own-1', name:'Rajesh Khanna' },
  { id:'user-o2', email:'priya@delhibites.com', password:'demo_owner', role:'owner', entityId:'own-2', name:'Priya Sharma' },
  { id:'user-r1', email:'manager@spiceroute.com', password:'demo_rst', role:'restaurant', entityId:'rst-1', name:'Vikram Joshi' },
  { id:'user-r5', email:'manager@delhibites.com', password:'demo_rst', role:'restaurant', entityId:'rst-5', name:'Delhi Bites Manager' },
];

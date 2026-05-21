export type ID = string;
export type UserRole = 'superadmin' | 'distributor' | 'owner' | 'restaurant';
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type PlanTier = 'basic' | 'pro' | 'enterprise';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'unpaid';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'online';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: ID;
  email: string;
  password: string; // plain for demo
  role: UserRole;
  entityId: ID; // distributorId | ownerId | restaurantId | 'superadmin'
  name: string;
  avatar?: string;
}

// ─── Platform ────────────────────────────────────────────────────────────────
export interface Plan {
  id: ID;
  name: string;
  tier: PlanTier;
  price: number; // monthly ₹
  yearlyPrice: number;
  maxRestaurants: number;
  maxStaff: number;
  features: string[];
  color: string;
}

export interface Distributor {
  id: ID;
  name: string;
  email: string;
  phone: string;
  region: string;
  state: string;
  commissionPct: number;  // % of subscription revenue
  status: Status;
  joinedAt: number;
  totalOwners: number;
  totalRestaurants: number;
  totalRevenue: number;
  commissionEarned: number;
}

export interface Owner {
  id: ID;
  distributorId: ID;
  planId: ID;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gst?: string;
  city: string;
  state: string;
  status: Status;
  joinedAt: number;
  subscriptionStart: number;
  subscriptionEnd: number;
  totalRestaurants: number;
  totalRevenue: number; // across all restaurants
}

export interface Restaurant {
  id: ID;
  ownerId: ID;
  name: string;
  type: string; // 'QSR' | 'Fine Dining' | 'Cafe' | 'Cloud Kitchen' ...
  phone: string;
  email?: string;
  address: string;
  city: string;
  gstin?: string;
  status: Status;
  createdAt: number;
  totalTables: number;
  totalOrders: number;
  totalRevenue: number;
}

// ─── Restaurant operations ───────────────────────────────────────────────────
export interface Category { id: ID; restaurantId: ID; name: string; color?: string }
export interface MenuItem {
  id: ID; restaurantId: ID; categoryId: ID;
  name: string; price: number; tax: number;
  veg: boolean; available: boolean; description?: string;
}

export interface OrderItem {
  id: ID; menuItemId: ID; name: string;
  price: number; qty: number; notes?: string;
  status?: 'new' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: ID; restaurantId: ID; number: number;
  type: OrderType; tableId?: ID; customerId?: ID;
  items: OrderItem[]; status: OrderStatus;
  payment: PaymentMethod;
  subtotal: number; discount: number; taxAmount: number; total: number;
  createdAt: number; updatedAt: number; servedBy?: ID;
}

export interface Table {
  id: ID; restaurantId: ID;
  name: string; area: string; seats: number;
  status: TableStatus; currentOrderId?: ID;
}

export interface Customer {
  id: ID; restaurantId: ID;
  name: string; phone: string; email?: string;
  loyaltyPoints: number; visits: number; totalSpent: number;
  lastVisit?: number;
}

export interface IngredientStock {
  id: ID; restaurantId: ID;
  name: string; unit: string; stock: number;
  minStock: number; costPerUnit: number; lastUpdated: number;
}

export interface Staff {
  id: ID; restaurantId: ID;
  name: string; role: string;
  phone: string; pin: string; active: boolean;
}

export interface Ticket {
  id: ID;
  from: UserRole;
  fromName: string;
  restaurantId?: ID;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: number;
}

export interface PlatformSettings {
  name: string;
  currency: string;
  supportEmail: string;
  defaultTax: number;
  trialDays: number;
}

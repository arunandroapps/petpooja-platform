import api from './client';

export const rstAPI = {
  // Menu
  getCategories: () => api.get('/rst/menu/categories').then(r => r.data),
  createCategory: (body: any) => api.post('/rst/menu/categories', body).then(r => r.data),
  updateCategory: (id: string, body: any) => api.patch(`/rst/menu/categories/${id}`, body).then(r => r.data),
  deleteCategory: (id: string) => api.delete(`/rst/menu/categories/${id}`),
  getMenuItems: () => api.get('/rst/menu/items').then(r => r.data),
  createMenuItem: (body: any) => api.post('/rst/menu/items', body).then(r => r.data),
  updateMenuItem: (id: string, body: any) => api.patch(`/rst/menu/items/${id}`, body).then(r => r.data),
  toggleMenuItem: (id: string) => api.patch(`/rst/menu/items/${id}/toggle`).then(r => r.data),
  deleteMenuItem: (id: string) => api.delete(`/rst/menu/items/${id}`),

  // Orders
  getOrders: (params?: Record<string, any>) => api.get('/rst/orders', { params }).then(r => r.data),
  getActiveOrders: () => api.get('/rst/orders/active').then(r => r.data),
  getOrder: (id: string) => api.get(`/rst/orders/${id}`).then(r => r.data),
  placeOrder: (body: any) => api.post('/rst/orders', body).then(r => r.data),
  updateOrderStatus: (id: string, status: string) => api.patch(`/rst/orders/${id}/status`, { status }).then(r => r.data),
  payOrder: (id: string, payment: string) => api.patch(`/rst/orders/${id}/pay`, { payment }).then(r => r.data),
  updateItemStatus: (orderId: string, itemId: string, status: string) => api.patch(`/rst/orders/${orderId}/items/${itemId}`, { status }).then(r => r.data),
  addItemsToOrder: (id: string, items: any[]) => api.post(`/rst/orders/${id}/items`, { items }).then(r => r.data),

  // Tables
  getTables: () => api.get('/rst/tables').then(r => r.data),
  createTable: (body: any) => api.post('/rst/tables', body).then(r => r.data),
  updateTable: (id: string, body: any) => api.patch(`/rst/tables/${id}`, body).then(r => r.data),
  updateTableStatus: (id: string, status: string) => api.patch(`/rst/tables/${id}/status`, { status }).then(r => r.data),
  deleteTable: (id: string) => api.delete(`/rst/tables/${id}`),

  // Customers
  getCustomers: (q?: string) => api.get('/rst/customers', { params: q ? { q } : {} }).then(r => r.data),
  searchCustomers: (phone: string) => api.get('/rst/customers/search', { params: { phone } }).then(r => r.data),
  createCustomer: (body: any) => api.post('/rst/customers', body).then(r => r.data),
  updateCustomer: (id: string, body: any) => api.patch(`/rst/customers/${id}`, body).then(r => r.data),
  deleteCustomer: (id: string) => api.delete(`/rst/customers/${id}`),

  // Inventory
  getInventory: () => api.get('/rst/inventory').then(r => r.data),
  createIngredient: (body: any) => api.post('/rst/inventory', body).then(r => r.data),
  updateIngredient: (id: string, body: any) => api.patch(`/rst/inventory/${id}`, body).then(r => r.data),
  adjustStock: (id: string, delta: number) => api.patch(`/rst/inventory/${id}/adjust`, { delta }).then(r => r.data),
  deleteIngredient: (id: string) => api.delete(`/rst/inventory/${id}`),

  // Staff
  getStaff: () => api.get('/rst/staff').then(r => r.data),
  createStaff: (body: any) => api.post('/rst/staff', body).then(r => r.data),
  updateStaff: (id: string, body: any) => api.patch(`/rst/staff/${id}`, body).then(r => r.data),
  deleteStaff: (id: string) => api.delete(`/rst/staff/${id}`),
  verifyPin: (staffId: string, pin: string) => api.post('/rst/staff/verify-pin', { staffId, pin }).then(r => r.data),

  // Reports
  getSummary: (days = 7) => api.get(`/rst/reports/summary?days=${days}`).then(r => r.data),
  getToday: () => api.get('/rst/reports/today').then(r => r.data),
};

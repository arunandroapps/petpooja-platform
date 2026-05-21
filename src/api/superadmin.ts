import api from './client';

export const saAPI = {
  // Distributors
  getDistributors: () => api.get('/sa/distributors').then(r => r.data),
  createDistributor: (body: any) => api.post('/sa/distributors', body).then(r => r.data),
  updateDistributor: (id: string, body: any) => api.patch(`/sa/distributors/${id}`, body).then(r => r.data),
  updateDistributorStatus: (id: string, status: string) => api.patch(`/sa/distributors/${id}/status`, { status }).then(r => r.data),

  // Owners
  getOwners: () => api.get('/sa/owners').then(r => r.data),
  createOwner: (body: any) => api.post('/sa/owners', body).then(r => r.data),
  updateOwner: (id: string, body: any) => api.patch(`/sa/owners/${id}`, body).then(r => r.data),
  updateOwnerStatus: (id: string, status: string) => api.patch(`/sa/owners/${id}/status`, { status }).then(r => r.data),

  // Restaurants
  getRestaurants: () => api.get('/sa/restaurants').then(r => r.data),
  updateRestaurantStatus: (id: string, status: string) => api.patch(`/sa/restaurants/${id}/status`, { status }).then(r => r.data),

  // Plans
  getPlans: () => api.get('/sa/plans').then(r => r.data),
  createPlan: (body: any) => api.post('/sa/plans', body).then(r => r.data),
  updatePlan: (id: string, body: any) => api.patch(`/sa/plans/${id}`, body).then(r => r.data),
  deletePlan: (id: string) => api.delete(`/sa/plans/${id}`).then(r => r.data),

  // Analytics
  getOverview: () => api.get('/sa/analytics/overview').then(r => r.data),
  getRevByDistributor: () => api.get('/sa/analytics/revenue-by-distributor').then(r => r.data),
  getDailyRevenue: (days = 30) => api.get(`/sa/analytics/daily-revenue?days=${days}`).then(r => r.data),

  // Tickets
  getTickets: (status?: string) => api.get(`/sa/tickets${status ? `?status=${status}` : ''}`).then(r => r.data),
  updateTicket: (id: string, body: any) => api.patch(`/sa/tickets/${id}`, body).then(r => r.data),
  resolveTicket: (id: string, reply?: string) => api.patch(`/sa/tickets/${id}/resolve`, { reply }).then(r => r.data),
  createTicket: (body: any) => api.post('/sa/tickets', body).then(r => r.data),
};

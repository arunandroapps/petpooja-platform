import api from './client';

export const ownerAPI = {
  me: () => api.get('/owner/me').then(r => r.data),
  getRestaurants: () => api.get('/owner/restaurants').then(r => r.data),
  createRestaurant: (body: any) => api.post('/owner/restaurants', body).then(r => r.data),
  updateRestaurant: (id: string, body: any) => api.patch(`/owner/restaurants/${id}`, body).then(r => r.data),
  getAnalytics: (days = 7) => api.get(`/owner/analytics?days=${days}`).then(r => r.data),
  getStaff: () => api.get('/owner/staff').then(r => r.data),
  getMenu: () => api.get('/owner/menu').then(r => r.data),
  getBilling: () => api.get('/owner/billing').then(r => r.data),
};

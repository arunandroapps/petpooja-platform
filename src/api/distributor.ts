import api from './client';

export const distAPI = {
  me: () => api.get('/dist/me').then(r => r.data),
  getOwners: () => api.get('/dist/owners').then(r => r.data),
  createOwner: (body: any) => api.post('/dist/owners', body).then(r => r.data),
  getRestaurants: () => api.get('/dist/restaurants').then(r => r.data),
  getCommission: () => api.get('/dist/commission').then(r => r.data),
  getAnalytics: () => api.get('/dist/analytics').then(r => r.data),
};

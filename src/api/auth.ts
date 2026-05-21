import api from './client';

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pp_access_token', data.accessToken);
    localStorage.setItem('pp_refresh_token', data.refreshToken);
    return data;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('pp_refresh_token');
    await api.post('/auth/logout', { refreshToken }).catch(() => {});
    localStorage.removeItem('pp_access_token');
    localStorage.removeItem('pp_refresh_token');
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

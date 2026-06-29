import client from './client';

export const authApi = {
  login: (data) => client.post('/api/identity/Account/Login', data),
  register: (data) => client.post('/api/identity/Account/Register', data),
  forgotPassword: (data) => client.post('/api/identity/Account/forgot-password', data),
  resetPassword: (data) => client.patch('/api/identity/Account/reset-password', data),
};

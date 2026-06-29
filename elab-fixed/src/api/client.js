import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = "https://elab.runasp.net";

console.log('API Base URL:', BASE_URL);

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('elab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const hasToken = !!localStorage.getItem('elab_token');
      localStorage.removeItem('elab_token');
      localStorage.removeItem('elab_user');
      
      // Only force a refresh if we were previously logged in.
      // This prevents infinite loops on public pages that might try to fetch protected data.
      if (hasToken) {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default client;
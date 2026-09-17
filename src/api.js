import axios from 'axios';
import { API_URL } from './config';
import router from './router';
import { useToastStore } from './stores/toast';
import { useAuthStore } from './stores/auth';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_beco');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
      && !window.location.pathname.startsWith('/login')
      && !window.location.pathname.startsWith('/cadastro')
      && !window.location.pathname.startsWith('/p/')
    ) {
      try {
        useAuthStore().fazerLogout();
        useToastStore().mostrar('Sessão expirada. Faça login de novo.', 'error');
      } catch {}
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;

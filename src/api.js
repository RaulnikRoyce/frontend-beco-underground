import axios from 'axios';
import { API_URL } from './config';

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
      localStorage.removeItem('token_beco');
      localStorage.removeItem('perfil_beco');
      localStorage.removeItem('email_beco');
      localStorage.removeItem('usuario_id_beco');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
